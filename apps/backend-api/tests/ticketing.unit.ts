import test from 'node:test';
import assert from 'node:assert/strict';
import { fn } from 'jest-mock';
import { TicketingService } from '../src/modules/ticketing/services/ticketing.service';

function createService() {
    const mockRedisClient = {
        hSet: fn(),
        hGetAll: fn(),
        isOpen: true,
    };

    const redisService = {
        runLuaScript: fn(),
        getClient: fn().mockReturnValue(mockRedisClient),
    };

    const mockPrisma = {
        ticketCategory: {
            findMany: fn(),
        },
    };

    const service = new TicketingService(redisService as any, mockPrisma as any);

    return { service, redisService, mockRedisClient, mockPrisma };
}

test('reserveTicket returns reservation success info when Lua script returns OK', async () => {
    const { service, redisService } = createService();

    redisService.runLuaScript.mockResolvedValue(['OK', '8', '2']);

    const result = await service.reserveTicket('user-1', {
        concert_id: 'concert-1',
        category_id: 'category-1',
        quantity: 2,
    });

    assert.equal(redisService.runLuaScript.mock.calls.length, 1);
    assert.deepEqual(redisService.runLuaScript.mock.calls[0][1], ['category:category-1', 'user:user-1:reservations']);
    assert.deepEqual(redisService.runLuaScript.mock.calls[0][2], ['2', 'category-1', '100']);

    assert.deepEqual(result, {
        status: 'SUCCESS',
        category_id: 'category-1',
        quantity: 2,
        remaining: 8,
        user_reserved: 2,
    });
});

test('reserveTicket throws BadRequestException when inventory is not initialized', async () => {
    const { service, redisService } = createService();

    redisService.runLuaScript.mockResolvedValue(['ERR_NOT_INITIALIZED']);

    await assert.rejects(
        async () => {
            await service.reserveTicket('user-1', {
                concert_id: 'concert-1',
                category_id: 'category-1',
                quantity: 2,
            });
        },
        (err: any) => {
            assert.equal(err.name, 'BadRequestException');
            assert.equal(err.message, 'ERR_NOT_INITIALIZED');
            return true;
        }
    );
});

test('reserveTicket throws BadRequestException when tickets are depleted', async () => {
    const { service, redisService } = createService();

    redisService.runLuaScript.mockResolvedValue(['ERR_NO_TICKET', '0']);

    await assert.rejects(
        async () => {
            await service.reserveTicket('user-1', {
                concert_id: 'concert-1',
                category_id: 'category-1',
                quantity: 2,
            });
        },
        (err: any) => {
            assert.equal(err.name, 'BadRequestException');
            assert.equal(err.message, 'ERR_NO_TICKET');
            return true;
        }
    );
});

test('reserveTicket throws BadRequestException when user limit is exceeded', async () => {
    const { service, redisService } = createService();

    redisService.runLuaScript.mockResolvedValue(['ERR_LIMIT_EXCEEDED', '2']);

    await assert.rejects(
        async () => {
            await service.reserveTicket('user-1', {
                concert_id: 'concert-1',
                category_id: 'category-1',
                quantity: 2,
            });
        },
        (err: any) => {
            assert.equal(err.name, 'BadRequestException');
            assert.equal(err.message, 'ERR_LIMIT_EXCEEDED');
            return true;
        }
    );
});

test('seedCategoryInventory correctly calls Redis HSET', async () => {
    const { service, mockRedisClient } = createService();

    mockRedisClient.hSet.mockResolvedValue(1);

    await service.seedCategoryInventory('category-123', 50, 4);

    assert.equal(mockRedisClient.hSet.mock.calls.length, 1);
    assert.equal(mockRedisClient.hSet.mock.calls[0][0], 'category:category-123');
    assert.deepEqual(mockRedisClient.hSet.mock.calls[0][1], {
        available: '50',
        max_per_user: '4',
    });
});

test('getCategoryInventory parses values correctly', async () => {
    const { service, mockRedisClient } = createService();

    mockRedisClient.hGetAll.mockResolvedValue({
        available: '45',
        max_per_user: '2',
    });

    const result = await service.getCategoryInventory('category-123');

    assert.equal(mockRedisClient.hGetAll.mock.calls.length, 1);
    assert.equal(mockRedisClient.hGetAll.mock.calls[0][0], 'category:category-123');
    assert.deepEqual(result, {
        available: 45,
        max_per_user: 2,
    });
});
