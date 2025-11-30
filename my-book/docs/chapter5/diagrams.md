# Chapter 5: AI Integration in Humanoids - Diagrams / Illustrations

## Perception-Cognition-Action Pipeline

This comprehensive diagram illustrates the complete flow of information in an AI-integrated humanoid robot.

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL ENVIRONMENT                     │
│                                                             │
│    Objects, Humans, Obstacles, Tasks, Unexpected Events    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   PERCEPTION STAGE (AI: Vision/Fusion)      │
│                                                             │
│  Sensors:                                                   │
│   • RGB Camera: Raw pixels (640×480×3 = 921,600 values)   │
│   • Depth Camera: 3D point cloud (640×480×3 = 900K points)│
│   • LiDAR: Environmental map (100K+ laser points)         │
│   • Proprioception: Joint angles, IMU (40+ sensor values) │
│                                                             │
│  AI Processing:                                             │
│   CNN: Images → Object detection                           │
│   PointNet: Point clouds → 3D scene understanding          │
│   Sensor Fusion: Combine multi-modal data (100 ms)         │
│                                                             │
│  Output: Semantic scene representation                      │
│   [Humans: [list], Objects: [list], Obstacles: [list]]     │
│   [Self-Pose: {position, orientation}]                    │
│   [Object-Properties: {color, shape, material, ...}]       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              COGNITION STAGE (AI: Reasoning/Planning)       │
│                                                             │
│  Symbolic Reasoning:                                        │
│   • Task decomposition: "Pick cup" → [Locate, Reach,      │
│     Grasp, Lift, Carry, Place]                             │
│   • Knowledge base queries: "Where is water source?"        │
│   • Logical inference: "If cup is hot, use tongs"           │
│                                                             │
│  Learned Prediction Models:                                 │
│   • Vision-Language: "What can I do with this object?"     │
│   • Dynamics: "What happens if I pull that?"               │
│   • Outcome prediction: "Will this grasp succeed?"          │
│                                                             │
│  Planning Algorithms:                                       │
│   • Path planning (RRT): Arm trajectory in 3D space        │
│   • Motion planning (collision avoidance)                   │
│   • Temporal planning (task sequencing)                     │
│                                                             │
│  Decision Making (RL Policy):                               │
│   • Neural network π(action | state)                        │
│   • Outputs: Grasp pose, arm trajectory, motor commands     │
│   • Considers: Success probability, energy cost, safety     │
│                                                             │
│  Output: Executable action plan                             │
│   [Action-sequence, Parameters, Success-probability]        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              ACTION STAGE (Control: Execution)              │
│                                                             │
│  High-Level Coordination:                                   │
│   • Whole-body control QP solver                            │
│   • Prioritize: Balance > primary task > efficiency         │
│                                                             │
│  Mid-Level Trajectory Execution:                            │
│   • Inverse kinematics: Target pose → Joint angles         │
│   • Trajectory generator: Smooth path over time             │
│   • Adapt to perturbations (wind, collisions)              │
│                                                             │
│  Low-Level Motor Control:                                   │
│   • PID controller per joint (1000 Hz)                      │
│   • Real-time sensor feedback (encoders, force/torque)     │
│   • Torque commands to actuators                            │
│                                                             │
│  Output: Actuator commands                                  │
│   [Motor1-PWM, Motor2-PWM, ..., Motor40-PWM]               │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌──────────────────────────┐
                │    PHYSICAL EXECUTION    │
                │                          │
                │  • Joints rotate         │
                │  • Limbs move            │
                │  • Forces applied        │
                │  • Environment interaction│
                └──────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              FEEDBACK & LEARNING STAGE                      │
│                                                             │
│  Immediate Feedback (Real-time Control Loop):               │
│   • Success/failure of current action                       │
│   • Sensor readback: Did joint move as expected?            │
│   • Force feedback: Contact information                     │
│                                                             │
│  Outcome Evaluation:                                        │
│   • Did task succeed or fail?                              │
│   • Quantify performance: Time, energy, accuracy            │
│   • Record: State, action taken, result                    │
│                                                             │
│  Learning (Offline, typically at night):                    │
│   • Store experience: (s, a, r, s') tuples                 │
│   • Update vision model: Improve object detection           │
│   • Update grasp model: Improve grasp prediction            │
│   • Update policy: Improve action selection                 │
│   • Update dynamics model: Refine world prediction          │
│                                                             │
│  Result: Better performance on next attempt                 │
└─────────────────────────────────────────────────────────────┘
                            ↑
                   [LOOP BACK TO PERCEPTION]
        Cycle time: 10-100 ms (depending on task level)

Legend:
─→ Information flow (1000s of bits)
Data volume: Perception ~1GB/hour, Cognition ~1MB/hour, Action ~1MB/hour
Computation: GPU for perception/learning, CPU for control
```

---

## Deep Learning Architecture for Humanoid Control

This diagram shows how neural networks transform sensor data into motor commands.

```
SENSOR INPUT LAYER
    ↓
    Vision Input: Image (640×480×3)
    ├─ RGB Data: 921,600 pixel values (0-255)
    └─ 0.1-0.5 MB per frame

    Proprioceptive Input: Joint state (40×3 = 120 values)
    ├─ Joint angles: 40 values
    ├─ Joint velocities: 40 values
    ├─ Motor currents: 40 values
    └─ ~1 KB total

    ↓↓↓

FEATURE EXTRACTION (CNN)
    ├─ Conv Layer 1: [640×480×3] → [320×240×64]
    ├─ Conv Layer 2: [320×240×64] → [160×120×128]
    ├─ Conv Layer 3: [160×120×128] → [80×60×256]
    ├─ Conv Layer 4: [80×60×256] → [40×30×512]
    │
    └─ Output: 512 feature channels
       (Learned representation, ~10KB)

    ↓↓↓

PROPRIOCEPTIVE PROCESSING (Shallow MLP)
    ├─ Layer 1: 120 inputs → 256 hidden units
    ├─ Layer 2: 256 → 128 hidden units
    │
    └─ Output: 128-dim proprioceptive features

    ↓↓↓

FUSION LAYER
    ├─ Concatenate: Vision features (512) + Proprioception (128)
    ├─ Combined: 640-dim fused feature vector
    │
    └─ Process: Apply attention to determine which features matter most

    ↓↓↓

POLICY NETWORK (Main Decision-Maker)
    ├─ Layer 1: 640 inputs → 512 hidden (ReLU activation)
    ├─ Layer 2: 512 → 256 hidden (ReLU)
    ├─ Layer 3: 256 → 128 hidden (ReLU)
    │
    └─ Output Layer: 128 → 80 action outputs
       40 targets for joint angles (degrees)
       40 gains for each joint (stiffness control)

MOTOR COMMAND GENERATION
    ├─ For each joint i:
    │  target_angle[i] = output[i]
    │  stiffness[i] = output[40+i]
    │
    └─ Apply torque control:
       τ[i] = stiffness[i] × (target - current_angle)

    ↓↓↓

MOTOR OUTPUT
    ├─ Joint 1: PWM = 128 (50% duty cycle)
    ├─ Joint 2: PWM = 200 (78% duty cycle)
    ├─ ...
    └─ Joint 40: PWM = 64 (25% duty cycle)

NETWORK STATISTICS:
- Total parameters: ~15 million
- Memory: ~60 MB
- Inference time: 50-100 ms on GPU, 200-500 ms on CPU
- Training data: 1-10 million examples
- Training time: 1-4 weeks on single GPU
```

---

## Reinforcement Learning Training Loop

This diagram shows how robots learn through trial and error.

```
REINFORCEMENT LEARNING CYCLE (Typical robot training)

STEP 1: ENVIRONMENT STATE
    State s(t):
    ├─ Robot joint positions
    ├─ Object positions
    ├─ Target location
    └─ Agent goal

STEP 2: POLICY DECISION (Neural network)
    Policy π(a | s):
    ├─ Input: Current state s(t)
    ├─ Neural network processes
    └─ Output: Probability distribution over actions

STEP 3: ACTION SELECTION
    Sample action a(t) from policy:
    ├─ 80% chance: Grasp-reach action
    ├─ 15% chance: Explore action (random)
    └─ 5% chance: Fallback action

STEP 4: ENVIRONMENT RESPONSE
    Execute action, observe:
    ├─ Next state s(t+1)
    ├─ Reward r(t)
    └─ Done flag (episode completed?)

    Reward examples:
    ├─ Successful grasp: r = +100
    ├─ Each timestep: r = -1 (encourage speed)
    ├─ Collision: r = -50
    └─ Dropped object: r = -100

STEP 5: REPLAY BUFFER
    Store experience tuple: (s, a, r, s', done)
    ├─ Replay buffer size: 1,000,000 experiences
    ├─ Samples for training drawn from this buffer
    └─ Allows off-policy learning (learn from past data)

STEP 6: LEARNING (Periodic, offline)
    Sample mini-batch of 64 experiences from replay buffer
    
    For each experience (s, a, r, s', done):
        Compute target value:
        Q_target = r + γ * max_a' Q(s', a')  [if not done]
        Q_target = r                         [if done]
        
        Compute prediction:
        Q_pred = Q(s, a)
        
        Loss:
        L = (Q_pred - Q_target)²
        
    Update network weights:
    θ ← θ - α ∇L
    
    Training: 10-100 mini-batch updates per episode

STEP 7: PERFORMANCE TRACKING
    Plot metrics over training:
    
    Episode Reward (sample trajectory)
    ├─ Episode 0-100: Average reward = -80 (mostly failures)
    ├─ Episode 1000: Average reward = +20 (learning!)
    ├─ Episode 10000: Average reward = +70 (good skill)
    └─ Episode 100000: Average reward = +90 (expert level)
    
    Success Rate:
    ├─ Episode 0: 10% success (random)
    ├─ Episode 1000: 30% success
    ├─ Episode 10000: 80% success
    └─ Episode 100000: 95% success (converged)

REPEAT for millions of episodes...

FINAL RESULT:
    Trained policy π(a | s) that achieves:
    ├─ 95% success rate on training task
    ├─ Generalizes to 60-80% success on similar tasks
    └─ Can be deployed on real robot

KEY INSIGHTS:
- Early training: Mostly random exploration
- Middle training: Gradual improvement as patterns emerge
- Late training: Fine-tuning and convergence
- Typical training: 1-4 weeks on GPU cluster
- Sim-to-real transfer: Often requires domain randomization
```

---

## Vision-Language Integration

This diagram shows how robots understand scenes described in natural language.

```
INPUT:
  Image:      [Visual perception of scene]
  Language:   "Hand me the blue cup near the window"

VISION PROCESSING (CNN encoder):
  Image → Feature extraction → Visual features
  [Objects detected: Cup_red, Cup_blue, Window, Shelf, etc.]
  [Spatial relationships detected: Near, On, Above, etc.]

LANGUAGE PROCESSING (Text encoder):
  Text → Tokenization → Token embeddings → Contextual encoding
  Tokens: ["Hand", "me", "the", "blue", "cup", "near", "window"]
  
  Language understanding:
  ├─ Action: HAND_OVER (give object to person)
  ├─ Object: blue_cup
  ├─ Spatial constraint: near_window
  └─ Recipient: human

VISION-LANGUAGE ALIGNMENT (Learned model):
  Project both modalities to shared space:
  
  Visual features: [cup_red_embedding, cup_blue_embedding, window_embedding]
  Language query: [blue_cup_near_window_embedding]
  
  Matching: Find visual features closest to language query
  ├─ cup_blue matches "blue" (very high similarity)
  ├─ window matches "near window" (spatial reasoning)
  └─ Final match: cup_blue near window (highest combined score)

DECISION (Policy network):
  Inputs: [Identified object location, Recipient location]
  Outputs: [Arm trajectory, Grip configuration, Delivery location]
  
  Decision tree:
  ├─ Object is fragile? → Use gentle grip (low force)
  ├─ Object is far? → Lean forward, extend arm fully
  ├─ Path to human blocked? → Replan around obstacle
  └─ Human ready to receive? → Extend object smoothly

ACTION EXECUTION:
  Arm moves to cup
  Gripper closes with measured force
  Arm moves to human
  Wait for human to take
  Gripper opens gently
  
RESULT: Cup successfully delivered to human
```

