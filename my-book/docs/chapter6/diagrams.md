# Chapter 6: Motion and Navigation - Diagrams / Illustrations

## Path Planning Algorithm Visualization

This diagram shows the difference between graph-based and sampling-based planning.

```
GRAPH-BASED PLANNING (Dijkstra, A*)

Environment: 50m × 50m warehouse, 10cm grid

┌────────────────────────────────────┐
│ S = Start (left)                   │
│ G = Goal (right)                   │
│ █ = Obstacles (shelves)            │
│ · = Free space (grid cells)        │
└────────────────────────────────────┘

Environment Map:
  █████████  G
  █·······█··
  █·█████·█··
  █·█   █·█··
  █·█ S █·█··
  █·█   █·█··
  █·█████·█··
  █········█·
  ██████████·

Dijkstra's Algorithm Execution:
  Grid size: 500 × 500 cells = 250,000 nodes
  Edges per node: 4-8 (adjacent cells)
  Algorithm: Expand from start, visiting lowest-cost unvisited nodes
  
  Cost Map (distance from start):
  ┌────────────────────────────────────┐
  │ 50 40 30 20 10  G                 │
  │ █ 41 42 43 44 █ 9  8  7          │
  │ █ 40 █ 44 45 █ 8  █ 6            │
  │ █ 39 █      █ 7  █ 5            │
  │ █ 38 █  S   █ 6  █ 4            │
  │ █ 37 █      █ 5  █ 3            │
  │ █ 36 █ 47 48 █ 4  █ 2            │
  │ █ 35 34 33 32 31 █ 1 1            │
  │ █ 36 37 38 39 40 █ 1 0            │
  └────────────────────────────────────┘
  
  Path: S → (step north around obstacles) → G
  Path length: 50 steps
  Computation time: ~1 second
  Path quality: Optimal (shortest path)


SAMPLING-BASED PLANNING (RRT)

Start: S
Goal: G
Sample count: 3000

Tree Growth (visualization at various iterations):

Iteration 100:
  Tree nodes: 100
  S ----*----* 
        \    \---* 
         \       \---* 
          \           * 
           *-*-*-* 

Iteration 1000:
  Tree nodes: 1000
  More coverage:
  S branches widely
  Many nodes approach G region
  
Iteration 2000:
  Tree nodes: 2000
  Some branches reach G region
  
Final iteration:
  Successfully connected!
  Path: S → (random walk) → G
  
Sampling trace:
  Sample 1: [30m, 40m] → too far, ignored
  Sample 2: [20m, 30m] → connects to tree
  Sample 3: [15m, 25m] → collision, ignored
  Sample 4: [35m, 35m] → connects toward goal
  ...
  Sample 2847: [48m, 49m] → within goal region!
  
Final path found after 2847 iterations
Path length: 62 steps (not optimal, longer than Dijkstra)
Computation time: ~500 ms (depends on random samples)
Path quality: Good (not optimal but collision-free)

COMPARISON:

                Dijkstra    RRT
Optimality:     Optimal     Suboptimal
Time:           1000 ms     500 ms
High-dimension: Poor        Excellent
Real-time:      No          Yes (after planning)
Predictability: Always      Variable
```

---

## Gait Generation and Walking Cycle

This diagram illustrates the walking cycle and how it translates to joint angles.

```
WALKING CYCLE (Duration: ~1 second at normal speed)

Phase Breakdown (Left-Right Leg Symmetry):

                      TIMELINE (seconds)
         0.0         0.25        0.5         0.75        1.0
         │           │           │           │           │
  Left   ├─ Stance ─┤ ├─ Swing ─┤ ├─ Stance ─┤ ├─ Swing ─┤
  Leg    │(flat)    │ │ (lift)  │ │(flat)    │ │ (lift)  │
         │          │ │         │ │          │ │         │
  Right  ├─ Swing ─┤ ├─ Stance ─┤ ├─ Swing ─┤ ├─ Stance ─┤
  Leg    │ (lift)  │ │(flat)    │ │ (lift)  │ │(flat)    │


JOINT ANGLE TRAJECTORIES OVER WALK CYCLE:

Hip Flexion (degrees)
    20 ┤     ╱╲
       │    ╱  ╲
     0 ├───╱    ╲───
       │ ╱        ╲
  -20 ├───────────
       └───────────────── Time (seconds)
       0  0.25  0.5  0.75  1.0

Knee Angle (degrees)
    60 ┤      ╱╲      ╱╲
       │     ╱  ╲    ╱  ╲
    30 ├────╱    ╲──╱    ╲
       │  ╱        ╲      ╲
     0 ├──────────  ────── ──
       └──────────────────────
       0  0.25  0.5  0.75  1.0

Ankle Angle (degrees)
    30 ┤───────  ───────
       │      ╲╱      ╲╱
     0 ├────────────────
       │    ╱╲      ╱╲
  -30 ├   ╱  ╲────╱  ╲──
       └──────────────────
       0  0.25  0.5  0.75  1.0

Interpretation:
- Hip flexion increases during swing (leg lifts and moves forward)
- Knee bends during swing (shorten leg for clearance)
- Ankle transitions from plantarflexion (toes point) to dorsiflexion (toe up)

Center of Mass (CoM) Trajectory:

Height above ground (cm)
    100 ┤   ╱╲   ╱╲   ╱╲
        │  ╱  ╲ ╱  ╲ ╱  ╲
     95 ├─╱    ╲╱    ╲╱    ╲
        │
        └────────────────── Time
        0  0.25  0.5  0.75  1.0

Horizontal position (cm)
    100 ┤╱─────────────────
        │
     50 ├─
        │
      0 └────────────────
        0  0.25  0.5  0.75  1.0

Pattern: CoM height dips during single-support (unstable; heavier load on one leg)
         CoM height peaks during double-support transition
         Horizontal movement: Smooth, nearly constant velocity


ZERO MOMENT POINT (ZMP) During Walking:

During double-support phase (both feet on ground):
  ┌─ Left foot ─┐     ┌─ Right foot ─┐
  L___L___L___L___ZMP___R___R___R___R___R
  
  ZMP can move across foot contact area
  Distance from center: 0-15 cm (safe)

During single-support phase (left foot planted):
  ┌───── Left foot ────────┐
  L___L___L___ZMP_L___L___L
  
  ZMP must stay under left foot
  Distance from center: 0-10 cm (high stability requirement)
  Body CoM must be directly above ZMP
  
Failure condition:
  ZMP exits support polygon → moment develops → robot tips

Control strategy to maintain ZMP:
  If ZMP drifts toward toe:
    Angle ankle to reduce toe load
    Shift hip backward
    
  If ZMP drifts toward heel:
    Angle ankle to increase toe load
    Shift hip forward
    
Active feedback at 100 Hz prevents falling
```

---

## SLAM Process: Building Maps and Localizing

This diagram illustrates how robots build maps while navigating unknown environments.

```
VISUAL SLAM PROCESS (ORB-SLAM)

Step 1: FEATURE DETECTION

Raw camera image:
┌──────────────┐
│              │
│     Wall     │
│              │
│  ┌────┐      │
│  │Door│      │  ← Unique features:
│  └────┘      │     Corners, edges, patterns
│   △ (object) │
└──────────────┘

ORB Feature Detection:
     *
    * *                    *
   *   *        →          * *
    * *    Corner         *
     *   detection        * *
        ╱╲ 
       ╱  ╲   Line→ * * * 
      ╱    ╲       (grouped as corner)

Detected features: ~1000 keypoints per image
Each feature has:
  - Position: (x, y) in image
  - Descriptor: 256-bit binary vector (describes local appearance)
  - Orientation: Angle for rotation invariance


Step 2: FEATURE TRACKING ACROSS FRAMES

Frame N-1: 
     Feature A (400, 300)
     Feature B (200, 150)
     ...
     
Frame N (0.1 seconds later):
     Feature A (410, 305)  ← Matched to Frame N-1
     Feature B (210, 155)  ← Matched to Frame N-1
     Feature C (500, 200)  ← New feature
     
Motion estimation:
  Feature A displacement: [10, 5] pixels
  Feature B displacement: [10, 5] pixels
  → Camera moved 10-12 pixels in frame (corresponds to ~0.2m in real world)


Step 3: 3D TRIANGULATION

Two camera positions (Frame N-1 and Frame N):
  Camera N-1 at position P1
  Camera N at position P2
  Feature A visible in both frames
  
Using camera intrinsics + feature positions:
  Draw ray from P1 through Feature A pixels
  Draw ray from P2 through Feature A pixels
  Intersection point → 3D world position of Feature A
  
Result: 3D map of Feature A coordinates


Step 4: LOOP CLOSURE

After exploring, robot revisits known location:
  
  Map before loop closure:
    [ Keyframe 1 ]
    [ Keyframe 2 ]
    ... (50 keyframes, drifted 1 meter)
    [ Keyframe 50 - position drifted to [5, 5] ]
    
    Detects features from Keyframe 1 again!
    
  Action: Recognize loop closure
    Keyframe 50 matches Keyframe 1
    → Add constraint: Keyframe 1 ≈ Keyframe 50
    
  Optimization: Redistribute error
    Previous trajectory:
      [0,0] → [0.1, 0.1] → [0.2, 0.3] → [1.0, 1.5] 
      accumulated error
    
    After loop closure:
      [0,0] → [0.05, 0.05] → [0.10, 0.15] → [0.5, 0.75]
      error distributed across entire trajectory
    
  Result: Much more accurate map


COMPUTATIONAL COST:

Image processing: 33 ms per frame (30 fps)
Feature detection: 10 ms
Feature matching: 5 ms
Motion estimation: 3 ms
Triangulation: 5 ms
Map optimization: 10 ms (every 10 frames)
─────────────────
Total: ~33 ms → real-time capable


LIDAR SLAM (Scan Matching):

LiDAR scan: 64 laser beams, 10 Hz scan rate
Point cloud: 64,000 points per scan (vertical scan)

Scan N-1: Points from location [0, 0]
Scan N: Points from location [0.3, 0]  (robot moved forward)

ICP (Iterative Closest Point):
  1. Find nearest point in Scan N for each point in Scan N-1
  2. Compute optimal transformation (rotation + translation)
  3. Apply transformation
  4. Repeat until convergence (usually 10-20 iterations)
  
Result: Transformation = [0.3, 0] (robot moved 0.3m forward)

Scan matching accuracy: 0.05-0.2m per scan
Better than visual SLAM: More robust to lighting, texture
More expensive: Requires more computation

Scan storage: 
  Each scan: ~1 MB (point cloud data)
  1 hour warehouse mapping: 36,000 scans = 36 GB
  Compression: 1-2 GB (after compression)
```

---

## Real-Time Obstacle Avoidance

This diagram shows how robots avoid obstacles dynamically.

```
DYNAMIC WINDOW APPROACH (DWA)

Humanoid robot receives goal: Navigate forward 10 meters
Current position: [0, 0]
Current velocity: [0.5 m/s, 0°]
Obstacle detected: 2 meters ahead, at angle 0°

Step 1: GENERATE CANDIDATE MOTIONS

Velocity space (discretized):
  v (forward): 0.0, 0.1, 0.2, ..., 1.5 m/s     (16 options)
  ω (rotation): -0.5, -0.4, ..., 0.0, ..., 0.5 rad/s (11 options)
  Total: 16 × 11 = 176 candidate motions

Example candidates:
  1. v=0.0 m/s, ω=0.0 rad/s (stop)
  2. v=0.5 m/s, ω=0.0 rad/s (straight forward)
  3. v=0.3 m/s, ω=0.1 rad/s (slight left turn)
  4. v=0.3 m/s, ω=-0.1 rad/s (slight right turn)
  ...


Step 2: SIMULATE EACH MOTION

For motion #2 (v=0.5 m/s, ω=0.0°):
  ┌──── Simulation 1 second ahead ────┐
  │ t=0.0s:  Position [0, 0]           │
  │ t=0.2s:  Position [0.1, 0]         │
  │ t=0.4s:  Position [0.2, 0]         │
  │ t=0.6s:  Position [0.3, 0]         │ ← Would hit obstacle!
  │ t=0.8s:  Position [0.4, 0]         │
  │ t=1.0s:  Position [0.5, 0]         │
  │                                    │
  │ Obstacle location: [2.0, 0]        │
  │ Collision? YES at t=0.4s           │
  │ Cost: ∞ (unsafe, reject)           │
  └────────────────────────────────────┘

For motion #4 (v=0.3 m/s, ω=-0.1 rad/s, slight right turn):
  ┌──── Simulation 1 second ahead ────┐
  │ t=0.0s:  Position [0.0,  0.0]     │
  │ t=0.2s:  Position [0.06, -0.01]   │
  │ t=0.4s:  Position [0.12, -0.04]   │
  │ t=0.6s:  Position [0.18, -0.09]   │ ← Clears obstacle!
  │ t=0.8s:  Position [0.24, -0.16]   │
  │ t=1.0s:  Position [0.30, -0.25]   │
  │                                    │
  │ Minimum distance to obstacle: 1.8m │
  │ Collision? NO                      │
  │ Cost: 5 (low cost - safe)          │
  └────────────────────────────────────┘


Step 3: SCORE EACH VALID MOTION

Cost function combines multiple objectives:

Cost = α·(distance_to_goal_error) 
     + β·(min_distance_to_obstacle)
     + γ·(smoothness_deviation)
     + δ·(speed_deviation)

For motion #4 (right turn):
  Distance to goal error: 9.7m (moved 0.3m toward 10m goal)
    Contribution: 0.3 × 9.7 = 2.9

  Min distance to obstacle: 1.8m (safe)
    Contribution: -0.1 × 1.8 = -0.18 (negative for safety)
  
  Smoothness: Changed ω by 0.1 rad/s (small)
    Contribution: 0.05 × 0.01 = 0.0005

  Speed deviation: 0.3 m/s (target 0.5)
    Contribution: 0.2 × 0.04 = 0.008

  Total cost: 2.9 - 0.18 + 0.0005 + 0.008 ≈ 2.73


Step 4: SELECT BEST MOTION

Evaluate all 176 motions:
  Motion 1: Cost = ∞ (collision)
  Motion 2: Cost = ∞ (collision)
  Motion 3: Cost = 2.81
  Motion 4: Cost = 2.73 ← BEST
  Motion 5: Cost = 2.85
  ...
  Motion 176: Cost = 5.2

Select motion #4: v=0.3 m/s, ω=-0.1 rad/s (gentle right turn)


Step 5: EXECUTE AND REPEAT

Send command: v=0.3 m/s, ω=-0.1 rad/s to motion controller
Wheels rotate accordingly
Robot steers gently right while moving forward
100 ms later: New sensor reading, new obstacle position
Re-run DWA (next iteration)

Result: Smooth, adaptive navigation around obstacle
Robot continuously updates motion based on new sensor data


PERFORMANCE COMPARISON:

Method          Time/decision  Smoothness  Reactivity
─────────────────────────────────────────────────────
Vector Field    &lt;5 ms          Low         Excellent
(VFH)           Too fast!      Jerky       Immediate

Potential       &lt;1 ms          Excellent   Sluggish
Fields          Too simple     Smooth      Delayed

Dynamic         50 ms          Good        Good
Window          Moderate       Smooth      Responsive

A*+Planning     1000 ms        Excellent   Poor
                Expensive      Very smooth Delayed
```

