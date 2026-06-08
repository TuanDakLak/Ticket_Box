## Description

This PR implements the upload features for concert images and seating maps, along with an automated Storage Garbage Collector to prevent storage leaks.

## Related Issues
Refs #upload-image-and-gc

## Changes

- **Upload APIs**:
  - `POST /uploads/image`: Upload concert posters to Supabase Storage with 5MB limit and format checks (Done).
  - `POST /uploads/svg`: Upload seating map SVGs to Supabase Storage with 2MB limit (Done).
- **Storage Garbage Collector (Worker)**:
  - Added `@nestjs/schedule` to the dependencies.
  - Implemented `StorageGcService` which runs a cron job daily to:
    - List uploaded files from the Supabase bucket.
    - Query database records (`poster_url`, `svg_map_url` in the `Concert` table) to find which files are currently in use.
    - Delete orphaned files older than 24 hours to prevent storage accumulation.
  - Integrated `WorkerModule` and `ScheduleModule` into the main application.

## Impact
- Allows administrators and organizers to upload assets.
- Automatically keeps storage usage clean by removing unused uploads.

## Checklist:
- [x] Self-reviewed
- [x] Tests added
- [x] No secrets committed
- [x] CI passing