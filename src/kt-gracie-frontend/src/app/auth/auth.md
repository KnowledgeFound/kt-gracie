TITLE
User CRUD Functionality with Local Storage

AS A: Frontend Developer

I WANT:
To create, read, update, and delete users using the user class, with data stored in local storage

SO THAT:
I can manage user data on the frontend without relying on a backend service

ACCEPTANCE CRITERIA:

I can create a new user using the user class and store it in local storage
I can retrieve the locally stored user
I can update an existing user’s data and persist the changes in local storage
I can delete a user from local storage
I can update the user's progress object
I can update the user's GRACIE's object

// localStorage key: "gracie_user"

createUser(fullName, age, gender) → User       // AC: create + store
getUser() → User | null                        // AC: retrieve
updateUser(updates) → User                     // AC: update + persist
deleteUser() → void                            // AC: delete
updateProgression(progression) → User          // AC: update progress object (SRS R3)
updateGracie(gracie) → User                    // AC: update GRACIE object (SRS R3)
Storage: single localStorage key ("gracie_user") holding the full serialized User object. v1 is single-user, so no keying by userId is needed.

User Model
Field	Type	Why
anonymousId	string (UUIDv4, generated client-side)	SRS R1 — unique, no identity link
firstName	string (NFC-normalized)	First name only — reduces PII vs full name
ageBucket	'AGE_17_19' | 'AGE_20_22' | 'AGE_23_25' | 'AGE_UNDISCLOSED'	Bucketed range — prevents age-based re-identification
gender	'MALE' | 'FEMALE' | 'UNDISCLOSED'	Simplified — reduces fingerprint surface
region	UN sub-region enum (19 values — Nuhamin to list)	Regional analytics without exposing country
country	string	Local-only, never sent to canister — UI display only
createdAt	string (ISO 8601)	Audit / ordering
updatedAt	string (ISO 8601)	Change tracking
lastActiveAt	string (ISO 8601)	Powers streak + city decay (24h timer)
gracie	GracieConfig	SRS R1 — initial Gracie object
progression	Progression	SRS R1 — initial Progress object
city	City	Visual progress state
tokenBalance	number	Cached count from token events