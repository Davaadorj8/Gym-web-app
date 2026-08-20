# Database Schema Specification (Prisma + Neon PostgreSQL)

## Models

- **User**: System accounts (super admin, trainers, staff).
- **Client**: Trainees with fitness goals, contact information, experience level, and notes.
- **WorkoutPlan**: Training routines and programs with categorization and difficulty levels.
- **Exercise**: Specific exercises in a workout plan with sets, reps, rest periods, and target muscle groups.
- **WorkoutSession**: Workout execution logs, ratings, and feedback.
- **AuditLog**: Traceability for sensitive actions and records updates.
