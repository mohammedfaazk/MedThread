# MedThread Global Health Trends - Data Sources

## Real-Time Data (Live APIs)

### COVID-19 Statistics
- **Source**: disease.sh API (https://disease.sh/v3/covid-19/)
- **Provider**: Johns Hopkins CSSE, Worldometers
- **Update Frequency**: Every 10 minutes
- **Data Points**:
  - Total cases (live)
  - Active cases (live)
  - Deaths (live)
  - Recovered (live)
  - Tests conducted (live)
  - Cases per million (live)
  - Country-specific data (live)
  - Last updated timestamp (live)

## Static Reference Data (WHO/CDC Estimates)

### Other Disease Prevalence
- **Source**: World Health Organization (WHO) Annual Reports & CDC Data
- **Update Frequency**: Annual estimates (2021-2023 data)
- **Diseases Covered**:
  1. Malaria - 247M cases/year (WHO 2021)
  2. Tuberculosis - 10.6M cases/year (WHO 2021)
  3. Dengue Fever - 390M cases/year (WHO estimate)
  4. Influenza - 1B cases/year (WHO seasonal)
  5. Cholera - 2.9M cases/year (WHO)
  6. Typhoid - 11M cases/year (WHO)
  7. Yellow Fever - 200K cases/year (WHO)
  8. Measles - 9M cases/year (WHO 2021)
  9. Pneumonia - 450M cases/year (WHO)
  10. Ebola - Outbreak-specific data
  11. Zika Virus - Regional data
  12. Bronchitis - Global estimates
  13. Common Cold - Seasonal estimates

### Country-Level Prevalence
- **Source**: WHO Disease Outbreak News, CDC Travel Health Notices
- **Data Type**: Endemic/epidemic status by country
- **Accuracy**: Based on official health organization reports

## Data Accuracy Summary

✅ **Highly Accurate (Real-Time)**:
- COVID-19 statistics (all metrics)
- Country-level COVID data
- Global COVID trends

⚠️ **Moderately Accurate (Annual Estimates)**:
- Other disease prevalence
- Country-level disease status
- Risk assessments

❌ **Not Available (No Public APIs)**:
- Real-time malaria case counts
- Live tuberculosis statistics
- Real-time dengue tracking (except some regional systems)

## Recommendations for Full Real-Time Data

To make ALL disease data real-time, you would need:
1. WHO API access (requires partnership/credentials)
2. CDC WONDER API integration
3. Regional disease surveillance systems
4. AI/ML models to estimate current cases from historical patterns
5. Integration with national health ministry APIs

Currently, only COVID-19 has comprehensive real-time public APIs available.
