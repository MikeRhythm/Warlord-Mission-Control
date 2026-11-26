-- ============================================================================
-- BOUNTY ENGINE LEDGER SCHEMA // ATOMIC TRANSACTION HARDENING
-- AUTHORITY: SILAS (DATABASE ARCHITECT) // MCNC BASE 1
-- CANONICAL PATH: C:\Warlord_Inc\Warlord_WASP\MCNC\Data\Projects\Bounty_Engine\Bounty_Ledger.db
-- PROTOCOL: SOP 14 INTEGRITY // ZERO-STATE INIT WITH UPSERT GUARDS
-- ============================================================================

-- ZERO-STATE INITIALIZATION: Drop existing tables to enforce clean schema migration
DROP TABLE IF EXISTS Bounties;
DROP TABLE IF EXISTS Campaign_Metadata;
DROP TABLE IF EXISTS Dispatch_Telemetry;
DROP TABLE IF EXISTS Render_Queue;

-- ============================================================================
-- TABLE 1: BOUNTIES (PRIMARY CAMPAIGN LEDGER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Bounties (
    Bounty_ID TEXT PRIMARY KEY NOT NULL,
    Platform TEXT NOT NULL DEFAULT 'Other',
    Campaign_Name TEXT NOT NULL,
    Target_Channels TEXT DEFAULT '[]',
    Clip_URL TEXT DEFAULT '',
    Status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(Status IN ('QUEUED', 'RENDERED', 'POSTED', 'PAID', 'EXPIRED', 'LOCKED')),
    Views INTEGER DEFAULT 0 CHECK(Views >= 0),
    Payout_USD REAL DEFAULT 0.0 CHECK(Payout_USD >= 0),
    CPM_Rate TEXT DEFAULT '$0.00',
    View_Floor TEXT DEFAULT '1000',
    Pool_Status TEXT DEFAULT 'ACTIVE // 100% Pool Left',
    Runway_Days INTEGER DEFAULT 10 CHECK(Runway_Days >= 0),
    Daily_Posts_Used INTEGER DEFAULT 0 CHECK(Daily_Posts_Used >= 0),
    Daily_Post_Cap INTEGER DEFAULT 5 CHECK(Daily_Post_Cap > 0),
    Mandatory_Tags TEXT DEFAULT '#shorts',
    Hook_Headline TEXT DEFAULT 'WATCH THIS',
    Source_Path TEXT DEFAULT '',
    Tess_Yield_Score REAL DEFAULT 0.0 CHECK(Tess_Yield_Score >= 0),
    Created_At TEXT NOT NULL DEFAULT (datetime('now')),
    Updated_At TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ATOMIC INDEX: Accelerate high-frequency status + platform queries
CREATE INDEX IF NOT EXISTS idx_bounties_status ON Bounties(Status);
CREATE INDEX IF NOT EXISTS idx_bounties_platform ON Bounties(Platform);
CREATE INDEX IF NOT EXISTS idx_bounties_yield_score ON Bounties(Tess_Yield_Score DESC);

-- ============================================================================
-- TABLE 2: CAMPAIGN_METADATA (EXTENDED ATTRIBUTES & AUDIT TRAIL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Campaign_Metadata (
    Bounty_ID TEXT PRIMARY KEY NOT NULL,
    Flat_Fee_Bonus REAL DEFAULT 0.0 CHECK(Flat_Fee_Bonus >= 0),
    Total_Clicks INTEGER DEFAULT 0 CHECK(Total_Clicks >= 0),
    Last_Dispatch_Date TEXT DEFAULT '',
    Locked_Reason TEXT DEFAULT '',
    Purge_Scheduled INTEGER DEFAULT 0 CHECK(Purge_Scheduled IN (0, 1)),
    Created_By TEXT DEFAULT 'AUTO_SCOUT',
    Last_Modified_By TEXT DEFAULT 'SYSTEM',
    FOREIGN KEY (Bounty_ID) REFERENCES Bounties(Bounty_ID) ON DELETE CASCADE
);

-- ============================================================================
-- TABLE 3: DISPATCH_TELEMETRY (EXECUTION LOG & GOVERNOR STATE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Dispatch_Telemetry (
    Dispatch_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Bounty_ID TEXT NOT NULL,
    Dispatch_Timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    Trigger_Source TEXT NOT NULL DEFAULT 'MANUAL',
    Clips_Rendered INTEGER DEFAULT 0 CHECK(Clips_Rendered >= 0),
    Post_Status TEXT DEFAULT 'PENDING',
    Error_Log TEXT DEFAULT '',
    FOREIGN KEY (Bounty_ID) REFERENCES Bounties(Bounty_ID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dispatch_timestamp ON Dispatch_Telemetry(Dispatch_Timestamp DESC);

-- ============================================================================
-- TABLE 4: RENDER_QUEUE (ATOMIC CLIP PROCESSING PIPELINE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS Render_Queue (
    Queue_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Bounty_ID TEXT NOT NULL,
    Source_Video_Path TEXT NOT NULL,
    Hook_Text TEXT NOT NULL,
    Start_Timestamp TEXT NOT NULL,
    End_Timestamp TEXT NOT NULL,
    Output_Filename TEXT NOT NULL,
    Render_Status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(Render_Status IN ('QUEUED', 'RENDERING', 'COMPLETE', 'FAILED')),
    Created_At TEXT NOT NULL DEFAULT (datetime('now')),
    Completed_At TEXT DEFAULT NULL,
    FOREIGN KEY (Bounty_ID) REFERENCES Bounties(Bounty_ID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_render_status ON Render_Queue(Render_Status);

-- ============================================================================
-- ATOMIC UPSERT STORED PROCEDURE (CAMPAIGN IMPORT GUARD)
-- ============================================================================
-- SQLite does not support native stored procedures, but this template demonstrates
-- the exact UPSERT pattern to enforce in all Node.js write operations:

-- EXAMPLE UPSERT PATTERN (to be implemented in Auto_Bounty_Engine.js):
-- BEGIN IMMEDIATE;
-- INSERT INTO Bounties (Bounty_ID, Platform, Campaign_Name, CPM_Rate, Pool_Status, Updated_At)
-- VALUES (?, ?, ?, ?, ?, datetime('now'))
-- ON CONFLICT(Bounty_ID) DO UPDATE SET
--     Platform = excluded.Platform,
--     Campaign_Name = excluded.Campaign_Name,
--     CPM_Rate = excluded.CPM_Rate,
--     Pool_Status = excluded.Pool_Status,
--     Updated_At = excluded.Updated_At;
-- COMMIT;

-- ============================================================================
-- ZERO-STATE SEED DATA (VERIFIED VYRO + WHOP BASELINE)
-- ============================================================================
BEGIN IMMEDIATE;

INSERT INTO Bounties (Bounty_ID, Platform, Campaign_Name, CPM_Rate, View_Floor, Pool_Status, Runway_Days, Mandatory_Tags, Hook_Headline, Tess_Yield_Score)
VALUES 
    ('vyro_abc_scrubs', 'Vyro', 'ABC: Scrubs // Humorous Clips Only', '$2.00', '1000', 'ACTIVE // 88% Pool Left (~14 Days)', 14, '#scrubs #abc #comedy #shorts #viral', 'THIS SCRUBS SCENE BROKE CHARACTER', 1.76),
    ('vyro_the_drop', 'Vyro', 'The Drop // TikTok Edits', '$2.00', '1000', 'ACTIVE // 76% Pool Left (~10 Days)', 10, '#thedrop #tiktokedits #shorts #viral', 'NOBODY EXPECTED THIS DROP MOMENT', 1.52),
    ('vyro_the_lowdown', 'Vyro', 'The Lowdown // TikTok Edits', '$2.00', '1000', 'ACTIVE // 71% Pool Left (~9 Days)', 9, '#thelowdown #edits #shorts #viral', 'THE LOWDOWN UNFILTERED TRUTH', 1.42),
    ('whop_viral_podcast_clips', 'Whop', 'Whop Content Rewards // Viral Podcast Clips', '$2.50', '1000', 'ACTIVE // 90% Pool Left (~14 Days)', 14, '#podcast #viralclips #shorts #fyp', 'HE SAID WHAT NOBODY DARED TO SAY', 2.025),
    ('whop_creator_highlights', 'Whop', 'Whop Content Rewards // High-Retention Stream Highlights', '$2.25', '1000', 'ACTIVE // 84% Pool Left (~12 Days)', 12, '#highlights #trending #shorts #viral', 'THIS MOMENT BROKE THE STREAM', 1.8225)
ON CONFLICT(Bounty_ID) DO NOTHING;

INSERT INTO Campaign_Metadata (Bounty_ID, Created_By)
VALUES 
    ('vyro_abc_scrubs', 'TESS_AUTO_SCOUT'),
    ('vyro_the_drop', 'TESS_AUTO_SCOUT'),
    ('vyro_the_lowdown', 'TESS_AUTO_SCOUT'),
    ('whop_viral_podcast_clips', 'TESS_AUTO_SCOUT'),
    ('whop_creator_highlights', 'TESS_AUTO_SCOUT')
ON CONFLICT(Bounty_ID) DO NOTHING;

COMMIT;

-- ============================================================================
-- SCHEMA VALIDATION CHECKPOINT
-- ============================================================================
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 30000000000;
PRAGMA page_size = 4096;

-- ============================================================================
-- END SCHEMA MIGRATION
-- ============================================================================