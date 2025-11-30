# Chapter 2: Humanoid Robotics Fundamentals - Diagrams / Illustrations

## Humanoid Skeletal Structure and Joint Systems Diagram

This diagram illustrates the typical skeletal structure of a humanoid robot, emphasizing the major joints and their degrees of freedom (DoF).

```mermaid
graph TD
    A[Head (3 DoF)] -- Neck --> B[Torso (3-6 DoF)];
    B -- Shoulders (3 DoF each) --> C1[Left Arm (7 DoF)] & C2[Right Arm (7 DoF)];
    C1 -- Elbow (1 DoF) --> D1[Left Forearm];
    C2 -- Elbow (1 DoF) --> D2[Right Forearm];
    D1 -- Wrist (2-3 DoF) --> E1[Left Hand (up to 20 DoF)];
    D2 -- Wrist (2-3 DoF) --> E2[Right Hand (up to 20 DoF)];
    B -- Hips (3 DoF each) --> F1[Left Leg (6 DoF)] & F2[Right Leg (6 DoF)];
    F1 -- Knee (1 DoF) --> G1[Left Lower Leg];
    F2 -- Knee (1 DoF) --> G2[Right Lower Leg];
    G1 -- Ankle (2-3 DoF) --> H1[Left Foot];
    G2 -- Ankle (2-3 DoF) --> H2[Right Foot];
```

**Description:**

1.  **Head (Neck Joint):** Typically has 3 DoF (pitch, yaw, roll) allowing the robot to look around, crucial for visual perception and social interaction.
2.  **Torso (Waist/Spine):** May have 3 to 6 DoF, providing flexibility for bending, twisting, and leaning. This is vital for balance, reaching, and dynamic movements.
3.  **Arms (Shoulder, Elbow, Wrist):** Each arm typically consists of:
    *   **Shoulder:** 3 DoF (pitch, yaw, roll) for extensive range of motion.
    *   **Elbow:** 1 DoF (pitch) for bending.
    *   **Wrist:** 2-3 DoF (pitch, yaw, sometimes roll) for orienting the hand.
    *   **Hands/Fingers:** Can range from simple grippers to highly dexterous multi-fingered hands with many DoF (up to 20 per hand) for fine manipulation.
4.  **Legs (Hip, Knee, Ankle):** Each leg is critical for locomotion and balance, typically with:
    *   **Hip:** 3 DoF (pitch, roll, yaw) for comprehensive leg movement.
    *   **Knee:** 1 DoF (pitch) for bending.
    *   **Ankle:** 2-3 DoF (pitch, roll, sometimes yaw) for foot orientation and ground contact.

This diagram provides a simplified representation. The actual number and configuration of DoF can vary significantly between different humanoid robot designs, depending on their intended applications and the desired level of agility and dexterity. The higher the number of DoF, the more complex the control system becomes.

## Bipedal Balance Illustration (Zero Moment Point Concept)

This illustration describes the Zero Moment Point (ZMP) concept, crucial for dynamic balance in bipedal locomotion.

```text
+---------------------------------------+
|                                       |
|               Robot Torso             |
|          (Center of Mass - CoM)       |
|                 (o)                   |
|                  |                    |
|                  |                    |
|                  |                    |
|        +---------+---------+          |
|        |    ^              |          |
|        |    | Force Vector |          |
|        |    v              |          |
|        +---------+---------+          |
|         /          \                  |
|        /            \                 |
|       /              \                |
|      /                \               |
|   [Left Foot]      [Right Foot]       |
|   (Support Area 1) (Support Area 2)   |
|                                       |
|              Support Polygon          |
|       <------------------------>      |
|                                       |
|           Zero Moment Point (ZMP)     |
|              (x)                      |
+---------------------------------------+

Key:
(o) - Center of Mass (CoM)
(x) - Zero Moment Point (ZMP)
Force Vector - Ground Reaction Force acting through ZMP
Support Polygon - Area on the ground bounded by the feet (or single foot in single support phase)
```

**Description:**

1.  **Center of Mass (CoM):** The average position of all the mass in the robot's body. Its trajectory is critical for dynamic motion.
2.  **Support Polygon:** The convex hull of all contact points between the robot's feet and the ground. During bipedal walking, this polygon changes as the robot lifts and places its feet.
3.  **Zero Moment Point (ZMP):** A specific point on the ground where the total moment (torque) of all forces acting on the robot (gravity, inertia, ground reaction forces) is zero. For a robot to maintain dynamic balance and not fall over, its ZMP must stay within its support polygon.
4.  **Ground Reaction Force:** The force exerted by the ground on the robot's feet. For stable walking, the net ground reaction force vector should pass through the ZMP.

This illustration demonstrates that by continuously calculating and controlling the ZMP to keep it within the dynamically changing support polygon, humanoid robots can achieve stable bipedal locomotion, even during complex movements. Control systems actively adjust joint torques and body posture to manipulate the ZMP's position.
