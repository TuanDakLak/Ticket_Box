import test from 'node:test';
import assert from 'node:assert/strict';
import { fn } from 'jest-mock';
import * as fs from 'fs';
import * as path from 'path';
import { GuestImportConsumer, parseCsvLine } from '../src/modules/worker/consumers/guest-import.consumer';
import { WorkerController } from '../src/modules/worker/controllers/worker.controller';

test('parseCsvLine utility parses fields correctly', () => {
  // Simple comma-separated values
  assert.deepEqual(parseCsvLine('john@example.com,John Doe,VIP'), ['john@example.com', 'John Doe', 'VIP']);

  // Double quotes around values containing commas
  assert.deepEqual(parseCsvLine('"Doe, John",john@example.com,"VIP, Premium"'), ['Doe, John', 'john@example.com', 'VIP, Premium']);

  // Escaped double quotes inside quoted values
  assert.deepEqual(parseCsvLine('"John ""The Boss"" Doe",john@example.com,VIP'), ['John "The Boss" Doe', 'john@example.com', 'VIP']);

  // Leading and trailing spaces trimming
  assert.deepEqual(parseCsvLine('  john@example.com  ,  John Doe  ,  VIP  '), ['john@example.com', 'John Doe', 'VIP']);
});

test('GuestImportConsumer handleGuestImport processes records, updates progress, and cleans up the file', async () => {
  const testCsvPath = path.join(process.cwd(), 'apps/backend-api/tmp-test-import.csv');

  // Create temporary directory if needed
  const dir = path.dirname(testCsvPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write mock CSV file with headers and records
  const csvContent = `email,full_name,ticket_category
john@example.com,John Doe,VIP
jane@example.com,Jane Doe,Standard
  `;
  fs.writeFileSync(testCsvPath, csvContent.trim());

  // Mock services
  const mockPrisma = {
    backgroundJob: {
      update: fn().mockResolvedValue({}),
    },
    $executeRawUnsafe: fn().mockResolvedValue(1),
  } as any;

  const mockRabbitMq = {
    consume: fn().mockResolvedValue({}),
  } as any;

  const consumer = new GuestImportConsumer(mockPrisma, mockRabbitMq);

  // Invoke private method
  await (consumer as any).handleGuestImport({
    jobId: 'test-job-id',
    concertId: 'test-concert-id',
    filePath: testCsvPath,
    userId: 'test-user-id',
  });

  // Verify DB raw execution was called for insertion
  assert.equal(mockPrisma.$executeRawUnsafe.mock.calls.length, 1);
  const rawQueryCall = mockPrisma.$executeRawUnsafe.mock.calls[0];
  const querySql = rawQueryCall[0];
  const queryParams = rawQueryCall.slice(1);

  assert.match(querySql, /INSERT INTO guest_lists/);
  assert.match(querySql, /ON CONFLICT\s*\(concert_id,\s*email\)\s*DO\s*UPDATE\s*SET/i);
  
  // Params should contain: ID, concertId, email, name, category, is_scanned for 2 users (total 12 items)
  assert.equal(queryParams.length, 12);
  assert.equal(queryParams[1], 'test-concert-id');
  assert.equal(queryParams[2], 'john@example.com');
  assert.equal(queryParams[3], 'John Doe');
  assert.equal(queryParams[4], 'VIP');
  assert.equal(queryParams[8], 'jane@example.com');
  assert.equal(queryParams[9], 'Jane Doe');
  assert.equal(queryParams[10], 'Standard');

  // Verify job status updates
  const updates = mockPrisma.backgroundJob.update.mock.calls;
  assert.ok(updates.length >= 3); // PROCESSING, progress updates, COMPLETED

  // First update should set status to PROCESSING
  assert.equal(updates[0][0].where.id, 'test-job-id');
  assert.equal(updates[0][0].data.status, 'PROCESSING');

  // Last update should set status to COMPLETED and results details
  const lastUpdate = updates[updates.length - 1][0];
  assert.equal(lastUpdate.where.id, 'test-job-id');
  assert.equal(lastUpdate.data.status, 'COMPLETED');
  assert.equal(lastUpdate.data.progress_percentage, 100);
  assert.equal(lastUpdate.data.result_data.processed, 2);

  // Verify file cleanup
  assert.equal(fs.existsSync(testCsvPath), false, 'Temporary CSV file should be deleted after consumption');
});

test('GuestImportConsumer handleGuestImport filters duplicates within the same batch', async () => {
  const testCsvPath = path.join(process.cwd(), 'apps/backend-api/tmp-test-import-dup.csv');
  
  // Write mock CSV with duplicate email in the same batch
  const csvContent = `email,full_name,ticket_category
john@example.com,John Doe First,VIP
john@example.com,John Doe Refined,Premium
  `;
  fs.writeFileSync(testCsvPath, csvContent.trim());

  // Mock services
  const mockPrisma = {
    backgroundJob: {
      update: fn().mockResolvedValue({}),
    },
    $executeRawUnsafe: fn().mockResolvedValue(1),
  } as any;

  const mockRabbitMq = {
    consume: fn().mockResolvedValue({}),
  } as any;

  const consumer = new GuestImportConsumer(mockPrisma, mockRabbitMq);

  // Invoke private method
  await (consumer as any).handleGuestImport({
    jobId: 'test-job-id-2',
    concertId: 'test-concert-id',
    filePath: testCsvPath,
    userId: 'test-user-id',
  });

  // Verify DB raw execution was called
  assert.equal(mockPrisma.$executeRawUnsafe.mock.calls.length, 1);
  const rawQueryCall = mockPrisma.$executeRawUnsafe.mock.calls[0];
  const queryParams = rawQueryCall.slice(1);

  // Due to email deduplication, only 1 record (the latest/last one) should be in parameters
  assert.equal(queryParams.length, 6); // 1 record has 6 columns
  assert.equal(queryParams[2], 'john@example.com');
  assert.equal(queryParams[3], 'John Doe Refined'); // Should be the second/updated record
  assert.equal(queryParams[4], 'Premium');

  // Verify file cleanup
  assert.equal(fs.existsSync(testCsvPath), false, 'Temporary CSV file should be deleted');
});

test('WorkerController.getJobStatus returns job when it exists', async () => {
  const mockJob = {
    id: 'test-job-id',
    status: 'COMPLETED',
    progress_percentage: 100,
  };
  const mockPrisma = {
    backgroundJob: {
      findUnique: fn().mockResolvedValue(mockJob),
    },
  } as any;
  const mockRabbitMq = {} as any;

  const controller = new WorkerController(mockPrisma, mockRabbitMq);
  const result = await controller.getJobStatus('test-job-id');

  assert.deepEqual(result, mockJob);
  assert.equal(mockPrisma.backgroundJob.findUnique.mock.calls.length, 1);
  assert.equal(mockPrisma.backgroundJob.findUnique.mock.calls[0][0].where.id, 'test-job-id');
});

test('WorkerController.getJobStatus throws NotFoundException when job does not exist', async () => {
  const mockPrisma = {
    backgroundJob: {
      findUnique: fn().mockResolvedValue(null),
    },
  } as any;
  const mockRabbitMq = {} as any;

  const controller = new WorkerController(mockPrisma, mockRabbitMq);

  await assert.rejects(
    async () => {
      await controller.getJobStatus('non-existent-id');
    },
    (err: any) => {
      assert.equal(err.message, 'Background job with ID non-existent-id not found');
      assert.equal(err.status, 404);
      return true;
    }
  );
});

test('WorkerController.getGuestList returns paginated list and metadata', async () => {
  const mockConcert = { id: 'test-concert-id', name: 'Test Concert' };
  const mockGuests = [
    { id: '1', email: 'a@test.com', full_name: 'A', ticket_category: 'VIP', is_scanned: false },
    { id: '2', email: 'b@test.com', full_name: 'B', ticket_category: 'GA', is_scanned: true },
  ];

  const mockPrisma = {
    concert: {
      findUnique: fn().mockResolvedValue(mockConcert),
    },
    guestList: {
      count: fn().mockResolvedValue(2),
      findMany: fn().mockResolvedValue(mockGuests),
    },
  } as any;
  const mockRabbitMq = {} as any;

  const controller = new WorkerController(mockPrisma, mockRabbitMq);
  const result = await controller.getGuestList('test-concert-id', {
    page: 1,
    limit: 10,
    search: 'test',
    category: 'VIP',
    is_scanned: false,
  });

  assert.deepEqual(result.data, mockGuests);
  assert.equal(result.meta.total, 2);
  assert.equal(result.meta.page, 1);
  assert.equal(result.meta.limit, 10);
  assert.equal(result.meta.totalPages, 1);

  // Verify Prisma queries
  assert.equal(mockPrisma.concert.findUnique.mock.calls.length, 1);
  assert.equal(mockPrisma.guestList.count.mock.calls.length, 1);
  assert.equal(mockPrisma.guestList.findMany.mock.calls.length, 1);
});

test('WorkerController.getGuestList throws NotFoundException when concert does not exist', async () => {
  const mockPrisma = {
    concert: {
      findUnique: fn().mockResolvedValue(null),
    },
  } as any;
  const mockRabbitMq = {} as any;

  const controller = new WorkerController(mockPrisma, mockRabbitMq);

  await assert.rejects(
    async () => {
      await controller.getGuestList('non-existent-concert-id', {});
    },
    (err: any) => {
      assert.equal(err.message, 'Concert with ID non-existent-concert-id not found');
      assert.equal(err.status, 404);
      return true;
    }
  );
});
