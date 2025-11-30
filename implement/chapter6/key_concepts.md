# Chapter 6: Motion and Navigation - Key Concepts

## Path Planning Algorithms

Path planning computes collision-free routes from start to goal locations.

### Graph-Based Planning (Dijkstra, A*)

**Discretization**: Convert continuous environment to graph
- Occupy grid: Divide space into cells (e.g., 10 cm × 10 cm)
- Nodes: Grid cells
- Edges: Connections between adjacent cells
- Cell types: Free (robot can traverse), Occupied (obstacle)

**Dijkstra's Algorithm**: Find shortest path
```
Initialize: Cost[start] = 0, Cost[all others] = ∞
Visited = {}

Loop:
  Current = unvisited node with lowest cost
  Visited.add(Current)
  
  For each unvisited neighbor N of Current:
    New_cost = Cost[Current] + distance(Current, N)
    If New_cost < Cost[N]:
      Cost[N] = New_cost
      Parent[N] = Current
```

**Result**: Path from start to goal with minimum cost (distance)

**Complexity**: O(N² log N) for N nodes, slow for large environments

**Example**: Warehouse with 100m × 100m area, 0.1m grid resolution
- Grid size: 1000 × 1000 = 1,000,000 cells
- Dijkstra time: ~1 second (acceptable for planning, not real-time)

**A* Algorithm**: Faster variant using heuristics
- Prioritizes nodes closer to goal
- Typical improvement: 10-100× faster than Dijkstra
- Example: Same warehouse, A* time: ~100 ms

**Limitation**: Discrete grid leads to "staircase" paths, inefficient for humanoid locomotion

### Sample-Based Planning (RRT, PRM)

**Rapidly-Exploring Random Tree (RRT)**:
1. Start with root node at start position
2. Repeatedly: Sample random position, connect tree toward it
3. Continue until tree reaches goal region

**Pseudocode**:
```
Tree.add(start)

For i = 1 to 10000:
  Random_config = RandomSample()
  Nearest = FindNearest(Tree, Random_config)
  
  New_config = StepToward(Nearest, Random_config, step_size)
  
  If CollisionFree(Nearest, New_config):
    Tree.add(New_config)
    SetParent(New_config, Nearest)
    
    If Distance(New_config, goal) < threshold:
      Return Path(start → goal)
```

**Advantages**:
- Handles high-dimensional spaces (humanoid arm: 7D)
- Probabilistically complete (finds solution if one exists)
- Fast: Often finds paths in 100-500 ms

**Disadvantages**:
- Paths are non-optimal (not shortest)
- Results vary between runs (randomness)

**Application**: Humanoid arm reaching
- State space: 7-dimensional joint angle space
- Goal: Reach object at [1.5m, 0.5m, 1.2m]
- RRT finds valid joint configuration in ~200 ms
- Path quality: Fine (smooth motion to object)

### Probabilistic Roadmap (PRM)

**Two-phase approach**:

**Phase 1: Learning (offline)**
- Sample 10,000-100,000 random configurations
- Connect nearby samples if collision-free
- Result: Graph of valid configurations

**Phase 2: Query (online)**
- Connect start and goal to nearest graph nodes
- Find shortest path in graph using Dijkstra
- Time: Typically <10 ms

**Advantage**: Multiple queries share same roadmap; very fast after learning

**Limitation**: Must recompute roadmap if environment changes

---

## Motion Planning for Humanoid Locomotion

Walking requires not just path planning but specific joint-angle trajectories.

### Gait Generation

**Walking Gait Phases** (cycle: ~1 second for normal walking speed)

1. **Heel Strike** (0.0-0.2s):
   - Left leg makes contact with ground
   - Right leg pushing off
   - Transition between legs

2. **Loading Response** (0.0-0.1s):
   - Left knee bends to absorb impact
   - Right leg leaving ground

3. **Mid-Stance** (0.1-0.3s):
   - Left foot planted, right leg swinging forward
   - Body weight transfers over left leg

4. **Terminal Swing** (0.3-0.5s):
   - Right leg approaching strike position
   - Left leg preparing to push off

5. **Pre-Swing** (0.4-0.5s):
   - Transition between legs

6. **Initial Swing** (0.5-0.8s):
   - Left leg swinging forward
   - Right leg providing stability

7. **Mid-Swing** (0.8-0.95s):
   - Left leg at peak swing height
   - Right foot supporting full weight

8. **Terminal Swing** (0.95-1.0s):
   - Left leg approaching ground for next heel strike

### Trajectory Optimization

**Objective**: Generate smooth joint trajectories that are stable and efficient

**Formulation** (mathematical):
```
Minimize: Energy = Σ τ²·t

Subject to:
  - Dynamics constraints (physics equations)
  - ZMP within support polygon (balance)
  - Joint limits: -θ_max ≤ θ ≤ θ_max
  - No collision with ground
```

**Algorithm**: Trajectory optimization using nonlinear programming
- Variables: Joint angles over 50-100 time steps
- Constraints: 50,000+ (for 100 steps × 50 constraints each)
- Solver: Interior point method
- Computation time: 1-10 seconds per trajectory (offline planning)

**Result**: Optimal walking trajectory that is energy-efficient and stable

### Center of Pressure (CoP) and Zero Moment Point (ZMP) Control

**Zero Moment Point (ZMP)**: Point on ground where total moment equals zero

**Stability Criterion**: For bipedal stability, ZMP must be within support polygon (area under feet)

**Control Strategy**:
```
During double-support (both feet planted):
  ZMP can be anywhere under feet
  
During single-support (one foot planted):
  ZMP must be under that foot
  
If ZMP moves outside support polygon:
  Moment develops
  Robot begins to tip
  Must prevent!
```

**Feedback Control**:
```
At each timestep:
  Compute current ZMP position (from force sensors)
  
  If ZMP approaching edge of support:
    Shift body CoM back over stable region
    Or place next foot further ahead
    
  Result: ZMP always stays centered in support
```

**Example**: Robot walking on narrow surface (e.g., balance beam)
- Support polygon: 0.2m wide
- Robot must keep ZMP within 0.2m region
- Walking speed reduced (need more careful balancing)
- Margins reduced to ±5 cm (high risk)
- Failure: If ZMP moves >0.1m from center, robot falls

---

## Obstacle Avoidance

### Vector Field Histogram (VFH)

Real-time obstacle avoidance for moving humanoids:

**Input**: Robot moving at target velocity; obstacle detected

**Algorithm**:
1. Quantize world around robot into histogram (e.g., 360 directions, 8 ranges)
2. For each obstacle, mark obstacles in histogram
3. Find valley (direction with fewest obstacles)
4. Steer toward valley

**Advantage**: Very fast (computation <10 ms)
**Limitation**: Only reacts to immediate surroundings (local method)

### Dynamic Window Approach (DWA)

More sophisticated real-time method:

**Concept**: Simulate robot motions for next few seconds; pick one that reaches goal without collision

**Algorithm**:
```
Generate candidate motions:
  v ∈ [v_min, v_max], step 0.1 m/s
  ω ∈ [ω_min, ω_max], step 0.1 rad/s
  Total candidates: ~100-200
  
For each candidate (v, ω):
  Simulate next 1-2 seconds
  Check for collisions
  Compute cost:
    - Distance to goal
    - Distance to nearest obstacle
    - Energy cost
  
Select: Candidate with lowest cost
```

**Advantage**: Looks ahead; smoother motions than VFH
**Computation**: ~50 ms per decision (5-10 Hz update rate)

### Potential Field Methods

Simple attractive and repulsive forces:

```
Force_total = F_attractive_to_goal + F_repulsive_from_obstacles

F_attractive = k_a × (goal - robot_pos)        [pulls toward goal]
F_repulsive = k_r × (1/distance_to_obstacle)   [pushes away]
```

**Advantage**: Intuitive; continuous forces (smooth motion)
**Disadvantage**: Can get stuck in local minima (attractive and repulsive forces cancel)

---

## SLAM (Simultaneous Localization and Mapping)

Autonomous robots must often navigate unknown environments. SLAM addresses this:
- Localization: Where am I?
- Mapping: What's around me?

### Visual SLAM (ORB-SLAM)

**Features**:
- Detect distinctive keypoints in images (ORB: Oriented FAST and Rotated BRIEF)
- Track features across consecutive frames
- Estimate motion from feature correspondences
- Triangulate 3D structure

**Pipeline**:
```
Frame N:
  Detect features: 500-1000 keypoints
  Extract descriptors: 256-bit binary for each
  Match: Compare with Frame N-1
  
Frame N-1 features matched to Frame N:
  ├─ 400 features successfully matched
  └─ Outliers: 20 spurious matches (RANSAC rejects)
  
Compute motion:
  Essential matrix from feature correspondences
  SVD decomposition
  Result: Rotation + Translation (camera moved 0.3m forward, rotated 5°)
  
Triangulate:
  Use matched features + camera motion
  Compute 3D positions of matched features
  Add to map: 400 new 3D points
  
Map size after 100 frames:
  ├─ 3D keyframe poses: 100
  ├─ 3D map points: 40,000
  └─ Computational load: Growing (need optimization)
```

**Loop Closure**: When robot revisits known location
- Detect: Features match previously seen location
- Action: Correct accumulated drift in estimates
- Effect: Dramatically improves map accuracy

**Accuracy**: 1-5% error (good for indoor environments)
**Computational cost**: ~50 ms per frame on modern CPU

### LiDAR SLAM (ICP and Graph SLAM)

**Process**:
1. Scan environment with 2D or 3D LiDAR
2. Match current scan to previous scans
3. Estimate motion from scan matching
4. Optimize global map

**Iterative Closest Point (ICP)**:
- Align two point clouds
- Find point correspondences (nearest neighbor)
- Compute optimal alignment minimizing distance
- Iterate until convergence

**Graph-Based Optimization**:
- Each scan pose = node in graph
- Scan-to-scan matches = edges
- Optimize all poses simultaneously to minimize error
- Handles loop closure naturally

**Accuracy**: 0.1-1% error (very accurate)
**Computational cost**: 100-500 ms per scan (more than visual SLAM, more robust)

---

## Real-Time Adaptive Motion

### Replanning During Execution

Humanoids often replan during locomotion:

**Trigger for replanning**:
- New obstacle detected (human walked into path)
- Goal location changed
- Computational resources available

**Fast replanning algorithms**:
- **D* Lite**: Update previous plan locally (~10 ms)
- **Theta***: Anytime algorithm (produce better paths if time available)
- **RRT***: Incremental planning (improve path quality over time)

**Example**: Robot walking to office when human blocks path
1. Original path: [0,0] → [10, 0] → [10, 5] → [20, 5]
2. Obstacle detected at [10, 0]
3. Replanning: [0, 0] → [5, 3] → [10, 5] → [20, 5] (6-second computation)
4. Continue walking on new path (only minor deviation)

### Energy-Efficient Locomotion

Different walking speeds have different energy costs:

```
Energy Cost (J/meter)
    │
 50 │      ╱╲
    │     ╱  ╲
 40 │    ╱    ╲
    │   ╱      ╲    Optimal speed
 30 │  ╱        ╲   1.2 m/s
    │ ╱          ╲
 20 │╱            ╲
    │              ╲
 10 │               ╲___
    │
    └─────────────────── Speed (m/s)
    0  0.5  1.0  1.5  2.0  2.5  3.0
```

**Optimization**: For long-distance navigation, walk at optimal speed
- Too slow: Inefficient (high per-meter cost)
- Too fast: Inefficient (muscular effort increases exponentially)
- Optimal: ~1.2-1.5 m/s for most humanoids

**Trajectory optimization** ensures minimal acceleration (also wastes energy)

