# CRISISCACHE
> **When the internet disappears, the community doesn't.**  
> *Decentralized Emergency Intelligence & Community Coordination (Version 1.0 — Hackathon MVP)*

---

## 1. Executive Summary & Core Proposition

During major disasters (floods, earthquakes, fires, severe blackouts), communication infrastructure collapses, emergency information fragments into conflicting rumors, and resource requests fail to reach nearby community providers.

Most existing emergency applications merely broadcast unstructured text messages or assume continuous cloud connectivity. 

**CRISISCACHE transforms fragmented emergency reports into an evolving, provenance-aware community intelligence picture.**

Its central innovation is **evidence lineage**:
- **Distinguishing Forwarding from Independent Witnesses**: If Device A reports a flooded underpass and 3 other devices forward that report (A → B → C), the system recognizes that all three messages originate from the same single observation. It does **not** count them as 4 independent witnesses.
- **Independent Corroboration**: When Device D independently creates a confirming observation, the independent source count increases and the incident status upgrades to **CORROBORATED**.
- **Contradiction Preservation**: When Device F reports that floodwaters are receding, the conflicting observation is **preserved and prominently highlighted** rather than silently deleted or averaged away. The incident status transitions to **CONTESTED**, presenting both supporting and conflicting evidence side-by-side.
- **Category-Specific Freshness TTL**: Dynamic expiration intervals tailored to emergency type (e.g. Floods: 45 min, Fires: 30 min, Road blockages: 2 hours). Reports age gracefully from `CURRENT` to `AGING` and `STALE` without erasing historical data.
- **Deterministic Multi-Source Resource Matching**: Aggregates partial supplies across disconnected nodes (e.g., Central Shelter needs 20 units of water; Riverside offers 12 + East District offers 8 = 20 units fulfilled). Requires explicit coordinator approval before marking fulfilled.
- **Local-First & Offline Resilience**: Operates entirely in the browser using Dexie.js (IndexedDB). Each simulated device maintains its own local cache, synchronizing missing events along active network paths when connectivity is restored.

---

## 2. Key Modules

| Module | Description |
|---|---|
| **Module A — Emergency Command Center** | Real-time situation overview, live stats calculated directly from the active device's local state, priority incidents with evidence badges, quick resource allocations, and partition bridge controls. |
| **Module B — Emergency Reporting** | Intuitive 4-step wizard with category icons, neighborhood coordinates, urgency levels, association with existing incidents (confirming/contradicting), and honest local storage receipts. |
| **Module C — Evidence Intelligence Engine** | The core differentiator: Interactive provenance graph, chronological timeline, forwarding hop inspector, independent vs forwarded replica counters, and conflict analysis. |
| **Module D — Community Incident Map** | High-contrast vector GIS map of the fictional community (North Ward, Riverside, Old Town, East District, Central Shelter) with live markers, bridge crossings, flood zones, shelters, and filterable layers. Works 100% offline without external API keys. |
| **Module E — Resource Coordination** | Deterministic matching engine that identifies compatible categories and units, combines partial offers, and provides a coordinator review pipeline. |
| **Module F — Network Simulator** | Ad-hoc mesh simulation featuring 6 disaster-zone devices. Allows clicking links to sever/reconnect communication paths, bridging network partitions, running gossip sync, and viewing live event transfer logs. |

---

## 3. The 1-Minute Demonstration Scenario ("The Flooded City")

Follow these steps to demonstrate the full capabilities of CRISISCACHE:

### Step 1: Open the Application & Examine Group 1 (West Partition)
1. Ensure the active viewing device in the top bar is **Device A — North Ward**.
2. Notice the top connectivity status: `PARTITIONED (2 GROUPS)`. Group 1 consists of `{Device A, Device B, Device C}`.
3. In the Command Center, observe incident **INC-01: Flooded Underpass**.
4. Click **Investigate Evidence Lineage** to open the **Evidence Explorer**:
   - Notice: Independent Observations = **1**, Forwarded Replicas = **2**.
   - Notice the forwarding path: `[Device A → Device B → Device C]`. Even though 3 devices hold the report, CRISISCACHE honestly recognizes only **1 independent witness**. Status is `UNVERIFIED`.

### Step 2: Switch to Group 2 (East Partition)
1. Switch the active viewing device selector in the top bar to **Device D — East District** or **Device F — Relief Team**.
2. Notice that Device D and F have their own local observations (`R-102` confirming the flood, and `R-103` reporting water receding).
3. Because the network is partitioned, Device A has not received `R-102` or `R-103` yet!

### Step 3: Check Resource Deficit at Central Shelter
1. Navigate to **Resource Hub** (`Sidebar → Resource Hub`).
2. Central Shelter (Device E) has an urgent request for **20 units of Drinking Water**.
3. Device B offers 12 units in Riverside, and Device D offers 8 units in East District.
4. Because the bridge between B and E is currently disconnected, the communities cannot coordinate the full supply.

### Step 4: Bridge Partitions & Run Gossip Synchronization
1. Navigate to **Network Simulator** (`Sidebar → Network Simulator`).
2. Click the **Bridge Partition (B ↔ E)** button (or click the dashed red line between Device B and Device E).
3. Click **Run Gossip Sync**.
4. Watch the live activity log:
   - Device B relays `R-101` across the bridge to Device E.
   - Device E relays `R-102` and `R-103` back to Device B and Device A.
   - Idempotency check: Duplicate deliveries are safely ignored while preserving original authorship and origin device tags.

### Step 5: Verify Corroboration, Contradiction, and Resource Allocation
1. Return to the **Command Center** or **Evidence Explorer**:
   - Status is now **CONTESTED**.
   - Independent Observations = **2** (Device A + Device D).
   - Conflicting Observations = **1** (Device F reports receding water). Both supporting and contradictory evidence are displayed side-by-side!
2. Open **Resource Hub**:
   - A Suggested Match appears combining **Device B (12 units) + Device D (8 units) = 20 units**.
   - Click **Approve Resource Allocation** as coordinator. The request is fulfilled!

### Step 6: Repeatability
- Click **Reset Demo** in the top bar at any time to instantly restore the initial demo state.

---

## 4. Technical Architecture

```
src/
├── types/                     # Core TypeScript entities & domain models
├── engine/
│   ├── provenance/            # Lineage tracking & original author preservation
│   ├── evidence-evaluation/   # Corroboration & contradiction state machine
│   ├── freshness/             # Category-specific TTL calculation
│   ├── synchronization/       # BFS graph path reachability & gossip relay
│   └── resource-matching/     # Deterministic partial-offer knapsack matching
├── data/
│   ├── database/              # Dexie.js (IndexedDB) persistence layer
│   └── seed/                  # Preloaded "The Flooded City" scenario
├── state/
│   └── store.tsx              # React Context providing multi-device state
├── components/
│   ├── common/                # Badges, modals, and buttons
│   ├── layout/                # Responsive Header and Sidebar
│   ├── dashboard/             # Module A: Emergency Command Center
│   ├── reporting/             # Module B: 4-Step Reporting Wizard
│   ├── evidence/              # Module C: Evidence Explorer & Provenance Graph
│   ├── map/                   # Module D: Vector GIS Incident Map
│   ├── resources/             # Module E: Resource Coordination Hub
│   └── network/               # Module F: Network Simulator & Log Terminal
└── test/
    └── acceptance.test.ts     # Automated tests for PRD Algorithmic Criteria
```

---

## 5. Algorithmic Acceptance Criteria & Test Verification

All 8 mandatory algorithmic tests from PRD Section 9 are automated with Vitest:

| Test | Objective | Status |
|---|---|---|
| **Test 1: Forwarded Duplicate** | A → B → C delivery chain retains origin Device A, independent count = 1. |  PASSED |
| **Test 2: Independent Confirmation** | R1 + R2 independent reports increase count to 2, status becomes CORROBORATED. |  PASSED |
| **Test 3: Contradiction** | Conflicting report marks status CONTESTED while preserving both reports visible. |  PASSED |
| **Test 4: Stale Information** | Elapsed time exceeding category TTL marks report STALE without erasing history. |  PASSED |
| **Test 5: Disconnected Devices** | BFS path traversal blocks sync across partitioned groups. |  PASSED |
| **Test 6: Intermittent Connectivity**| Enabling bridge link B-E propagates events along multi-hop path. |  PASSED |
| **Test 7: Resource Matching** | 12 + 8 = 20 units partial matching requires explicit coordinator approval. |  PASSED |
| **Test 8: Idempotent Sync** | Repeated sync passes do not alter origin or create duplicate evidence. |  PASSED |

---

## 6. Setup & Execution Instructions

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Commands

```bash
# Install dependencies
npm install

# Run automated acceptance test suite
npm test

# Run local development server
npm run dev

# Build production bundle
npm run build
```

---

## 7. Limitations & Honest Scope

- **Networking**: Device connectivity is simulated using an in-browser graph path reachability engine. It does not access physical Bluetooth Low Energy or Wi-Fi Direct hardware.
- **Identity**: Uses pseudonymous simulated device identifiers. Cryptographic Ed25519 signatures are reserved for future hardware transport layers.
- **Mapping**: Fictional vector community map runs 100% offline without dependencies on external paid Google Maps APIs.
