# Chapter 6: Motion and Navigation - Practical Examples

## Boston Dynamics Atlas: Parkour on Uneven Terrain

Boston Dynamics demonstrated remarkable navigation and motion capabilities through their parkour videos.

### Environment

**Course Design**:
- Multiple platforms at different heights (0.5-1.5 meters)
- Large gaps requiring jumps (1-2 meters)
- Slopes and irregular terrain
- Obstacles requiring climbing and vaulting

### Navigation Strategy

**High-Level Planning**:
1. Human defines course visually
2. Computer vision identifies key waypoints (obstacles, platforms)
3. Path planning generates sequence of actions:
   - "Jump to platform 1"
   - "Walk across platform 2"
   - "Vault over rail"
   - "Jump to platform 3"

**Per-Action Planning** (for each maneuver):
1. Identify approach vector
2. Compute required velocity before maneuver
3. Plan foot placement for maximum stability
4. Generate smooth trajectory

### Motion Execution

**Example: Jumping 1.5-meter gap**

**Phase 1: Approach** (1-2 seconds)
- Walk toward platform edge at optimal speed
- Monitor distance to edge (LiDAR measurement)
- Time acceleration and deceleration for precise speed at edge

**Phase 2: Takeoff** (0.2 seconds)
- Both legs compress (squat position)
- Explosive leg extension generating upward velocity
- Required velocity: 3.5 m/s upward (from physics calculation)
- Force required: ~2× body weight
- Power peak: 5000 W (brief burst)

**Phase 3: Flight** (0.5 seconds)
- No leg control (airborne)
- Body rotates to prepare for landing
- Monitor trajectory relative to target platform
- Arm motions provide stabilization

**Phase 4: Landing** (0.1 seconds)
- Feet approach landing platform
- Legs bend (cushion impact)
- Force sensors detect contact
- Distribute impact across both legs

**Phase 5: Stabilization** (0.5 seconds)
- Regain balance on new platform
- Internal forces redistribute
- Return to walking stance

**Total time**: ~2.3 seconds per jump
**Energy**: ~1000 J per jump (significant energy consumption)
**Success rate**: 95%+ after training

### Key Technical Achievements

**Real-time Perception**: Vision system processes 100+ visual features per second to estimate terrain

**Dynamic Balance**: ZMP control maintains balance on unstable platforms (<5 cm margin)

**Adaptive Locomotion**: Changes walking gait based on terrain slope and surface friction

**Predictive Planning**: Anticipates landing position and adjusts mid-air if needed

---

## Fetch Robotics Autonomous Warehouse Navigation

Fetch robots demonstrate practical autonomous navigation at scale.

### Warehouse Environment

**Challenge**: Large-scale (1000+ m²), dynamic (humans working), varied terrain

### SLAM for Warehouse Mapping

**Mapping Phase** (first deployment):
1. Human operates robot manually, drives through warehouse
2. LiDAR scans continuously (10 Hz)
3. Robot builds map in real-time
4. ICP algorithm matches consecutive scans
5. Loop closure detection: When robot revisits area, corrects drift

**Result**: 
- Warehouse map: 50,000+ 3D LiDAR points
- Map accuracy: ±0.2 meters (sufficient for navigation)
- Mapping time: 1-2 hours for typical warehouse
- Map size: ~50 MB (easily stored)

### Autonomous Navigation

**Task**: "Deliver package from packing station A to shipping dock B"

**Planning** (100 Hz):
- Localize robot: Match current LiDAR scan to map
- Position error: Typically <0.1 m
- Path planning: Compute collision-free route
- Route: A → Corridor 1 → Intersection 1 → Corridor 2 → B
- Planning time: <50 ms

**Execution** (10 Hz):
- Command wheel velocities (mobile base control)
- Monitor LiDAR for obstacles
- If obstacle detected: Replan locally (D* Lite)
- Feedback from odometry (wheel encoders)

**Obstacle Avoidance** (50 Hz):
- Dynamic Window Approach
- Consider 200 candidate motions
- Rank by safety and goal progress
- Execute best motion
- Adapt to moving humans

**Example Scenario**: Narrow corridor, human walking toward robot
1. Robots 2 meters apart, moving toward collision
2. Robot A detects human at 1 meter distance
3. Computes: Can stop in time? Yes (1m, deceleration 0.5 m/s²)
4. Selects: Decelerate (safer than swerving in narrow space)
5. Human passes without collision

### Performance Metrics

**Navigation Accuracy**: 98%+ successful autonomous navigation
**Collision Rate**: <0.1% (very safe in human environment)
**Energy Efficiency**: 500 Wh per 100 meters (battery provides 4-6 hours runtime)
**Throughput**: 50-100 deliveries per shift (8 hours)

### Real-World Challenges and Adaptations

**Challenge 1: Map Drift**
- Problem: After days of operation, localization accumulates error
- Solution: Periodic loop-closure optimization; rebuild map weekly
- Result: Maintains accuracy over weeks of operation

**Challenge 2: Dynamic Obstacles**
- Problem: Humans unexpectedly block planned path
- Solution: Real-time replanning; local obstacle avoidance
- Result: <1% of navigations require human intervention

**Challenge 3: Worn Floors**
- Problem: New markings or changed flooring affects features
- Solution: Domain adaptation; retrain perception on new conditions
- Result: Maintains performance across environment changes

---

## Walking Efficiency Study: Humanoid vs. Human

Biomechanics research compares humanoid and human walking efficiency.

### Energy Consumption Comparison

**Human Walking**:
- Speed: 1.4 m/s (comfortable pace)
- Energy cost: ~0.5 J/kg/meter (biological efficiency)
- For 70 kg person: ~35 J/meter
- Runtime: 8 hours, distance ~40 km

**Current Humanoid** (Atlas-class):
- Speed: 1.4 m/s
- Energy cost: ~20 J/kg/meter (10× less efficient)
- For 70 kg robot: ~1400 J/meter
- Runtime: 1 hour, distance ~3 km (with typical battery)

**Gap Analysis**:
- Humans: Optimized by evolution over millions of years
- Humanoids: ~30 years of development
- Root causes of inefficiency:
  - Electric motors: 60-80% efficient vs. biological muscles (50%+, but with better control)
  - Control: Humanoid uses more precise but less efficient gaits
  - Mechanical friction: Joints and gearboxes add losses

### Efficiency Improvements Through Learning

**Gait Optimization** (machine learning approach):

1. **Baseline gait**: Hand-designed trajectory (initial efficiency: 5 W·h/km)

2. **Learned improvement**: RL optimization in simulator
   - Train policy to minimize: power + speed deviation from target
   - Result: 4.2 W·h/km (16% improvement)

3. **Terrain adaptation**: Learn gaits for different surfaces
   - Soft terrain (grass, sand): Longer stride (energy saving)
   - Hard terrain (concrete): Shorter stride (reduces impact)
   - Result: 3.8 W·h/km average (24% improvement over baseline)

4. **Predictive optimization**: Learn to anticipate terrain
   - Vision system predicts surface type 1 meter ahead
   - Pre-adjust gait before reaching terrain
   - Result: 3.5 W·h/km (30% improvement)

**Impact**: 30% efficiency gain → 3× longer runtime (1 hour → 3 hours)

---

## Obstacle Avoidance in Crowded Environments

Testing autonomous navigation in crowded spaces.

### Scenario: Robot navigating busy hallway

**Environment**:
- Hallway width: 2 meters
- Human density: 1 person per 2 m² (crowded but not packed)
- Human speeds: 0.5-1.5 m/s (variable)
- Visibility: Partially occluded (humans block view)

### Robot Behavior

**Detection** (LiDAR + vision):
1. Detect all humans in hallway (depth cameras)
2. Estimate their velocities (track over time)
3. Predict their paths 1-2 seconds ahead

**Decision Making**:
- Humans ahead: Pause or slow down?
- Path clear: Navigate through gaps?
- Risk assessment: How likely is collision?

**Execution**:
- Dynamic Window Approach considers safety margins
- Comfortable safety distance: 0.5 meters
- If robot can't maintain: Slower speed or full stop

### Success Metrics

**Collision Rate**: 
- Uncontrolled humanoid: 5-10% collisions in crowded hallway
- With DWA: 0.1% collisions (excellent safety)

**Discomfort to Humans**:
- Did humans have to stop or change path?
- Discomfort rate: ~5% (robot slowed or stopped, didn't block)

**Navigation Time**:
- Clear hallway: 10 seconds (2 m/s speed)
- Crowded hallway: 25 seconds (0.8 m/s average)
- Overhead from crowd avoidance: 2.5× slowdown (acceptable)

### Real-World Deployment

After initial testing, robot deployed in busy hospital hallway:
- **Week 1**: Several minor collisions, humans gave feedback
- **Week 2-4**: Behavior refined based on feedback
- **After adaptation**: Robot accepted by hospital staff, safe navigation achieved

**Key learning**: Robots must adapt to specific human environments, not just generic crowds

