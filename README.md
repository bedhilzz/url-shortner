# Architecture Overview:
I only use one data record for this system i.e. ShortUrl record entity.
| Field              | Type             | Description                                              |
| ------------------ | ---------------- | -------------------------------------------------------- |
| `short_code`       | string (PK)      | Human-readable identifier (6 chars, restricted alphabet) |
| `long_url`         | string           | Original destination URL                                 |
| `created_at`       | timestamp        | When the short URL was created                           |
| `expires_at`       | timestamp        | Absolute expiration time                                 |
| `click_count`      | integer          | Total number of successful redirects                     |
| `last_accessed_at` | timestamp | null | Last time the URL was resolved                           |

<img width="1521" height="417" alt="image" src="https://github.com/user-attachments/assets/05ff02a3-ae7b-4b22-bdc8-4b99067ce6f6" />

# Gap Analysis:
In memory is not suitable for High Availability and distributed system because the data state
is isolated to only one machine instance. So let's say the system has 2 machine instances, 
user A  served by machine 1, user B served by machine 2. user A and B performs identical action(s),
the system will treat those actions as a different action, meanwhile it shouldn't. It's because the
state uniqueness is not distributed to across different machine instances. To solve this, separate
data store can be used, e.g. dedicated in memory store like Redis.
 
# Capacity Planning:
## Traffic / Data
- 100 million new URLs / month
- 12 months >> 1.2 billion records
- Short code length: 6 chars (assumption, as implemented in the code).
  - Statistically speaking, it only has 3.5% probability of collision for records last in a year
- Average long URL length: 120 bytes

TTL: default 24 hours, but stats endpoint implies records are retained at least until expiration; assume store full record until expiration
| Field                                  | Approx size |
| -------------------------------------- | ----------- |
| short_code (6 chars)                   | ~6 B        |
| long_url (avg)                         | ~120 B      |
| created_at (timestamp)                 | 8 B         |
| expires_at (timestamp)                 | 8 B         |
| click_count (int64)                    | 8 B         |
| last_accessed_at (timestamp, nullable) | 8 B         |
| **Subtotal (raw)**                     | **~166 B**  |

Redis overhead storage: ~60 bytes
Total storage per records: ~226 bytes, round it to 250 bytes
Storage backend: Redis or Postgres-like structured storage

100,000,000 records × 250 bytes ~ 25,000,000,000 bytes = 25 GB / month
12 month period will be 300 GB (max, with user specify very long expiry time)

## For handling 10,000 rps. Here's the architecture design I propose
- Load balancer
- Stateless API pod that run NestJS application
- Redis cluster

Scaling technique:
- No session affinity config in Load balancer, leveraging stateless capability
- Horizontal scaling by automatically adding more pods

# Service Level Management:
Define two Service Level Indicators (SLIs) for this service and
propose a Service Level Objective (SLO) for each. Describe one specific scenario that would
necessitate an on-call intervention.

# Future Enhancements:
For this design, I don't really think about scalability in infrastructure side. So, for
future improvement, one thing that can be done is defining horizontal scaling strategy.
For standard and easier maintainability, I would like to propose to automate the scalibility
using Kubernetes engine it aslo helps orchestrating the incoming request. Other than that,
it also has self healing capability i.e. restarting the system automatically in case there is
disruption happening.
