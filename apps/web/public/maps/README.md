# India States GeoJSON

This directory contains the GeoJSON file for India states used by the symptom heatmap feature.

## File: india-states.geojson

This file contains the geographic boundaries of Indian states and is used to render the interactive map on the `/trends` page.

**Source:** https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson

The file has been downloaded and is ready to use. If you need to update it, you can download it again using:

```bash
curl -o apps/web/public/maps/india-states.geojson https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson
```

## State Name Mapping

The GeoJSON file uses the `NAME_1` property for state names. Make sure that the `state` field in your User model matches these exact names for proper mapping on the heatmap.

Common state names in the GeoJSON:
- "Andhra Pradesh"
- "Karnataka" 
- "Kerala"
- "Tamil Nadu"
- "Maharashtra"
- "Gujarat"
- etc.