import type { LngLatLike } from "maplibre-gl";
import { writable } from 'svelte/store';

export interface Marker {
  name: string;
  description: string;
  coordinates: LngLatLike | null;
  google_maps_link: string;
}

// Create a store for markers and error state
export const markers = writable<Marker[]>([]);
export const markersError = writable<string | null>(null);

// Function to convert DMS (Degrees, Minutes, Seconds) to decimal degrees
function dmsToDecimal(dmsStr: string): number | null {
  try {
    // Clean up the input string
    const dms = dmsStr.trim().replace(/"/g, '');
    
    // Match pattern like 41°42'26.1N or 44°46'29.7E
    const match = dms.match(/(\d+)°(\d+)'([\d.]+)(N|S|E|W)$/i);
    if (!match) return null;

    const degrees = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseFloat(match[3]);
    const direction = match[4].toUpperCase();

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
      return null;
    }

    let decimal = degrees + (minutes / 60) + (seconds / 3600);
    
    // Make negative for South or West
    if (direction === 'S' || direction === 'W') {
      decimal = -decimal;
    }

    return decimal;
  } catch (error) {
    return null;
  }
}

// Parse coordinates in DMS format
function parseCoordinates(coordStr: string): LngLatLike | null {
  try {
    // Remove any extra quotes and split on whitespace
    const parts = coordStr.replace(/"/g, '').trim().split(/\s+/);
    
    if (parts.length !== 2) return null;

    const lat = dmsToDecimal(parts[0]); // First part is latitude (N/S)
    const lng = dmsToDecimal(parts[1]); // Second part is longitude (E/W)

    if (lat === null || lng === null) return null;

    // Validate coordinates are within valid ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }

    return [lng, lat]; // MapLibre uses [longitude, latitude] order
  } catch (error) {
    return null;
  }
}

// Parse CSV data into markers
function parseCSV(csvText: string): Marker[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',');
  
  // Updated field names to match the Georgian CSV headers
  const nameIndex = headers.findIndex(h => h.trim() === 'ლოკაციის სახელი');
  const descriptionIndex = headers.findIndex(h => h.trim() === 'ლოკაციის აღწერა');
  const coordinatesIndex = headers.findIndex(h => h.includes('კოორდინატები'));
  const googleMapsLinkIndex = headers.findIndex(h => h.trim() === 'Google Maps-ის ლინკი');

  if (nameIndex === -1 || coordinatesIndex === -1) {
    throw new Error('Required columns are missing from the CSV');
  }
  
  let validMarkers = 0;
  let skippedMarkers = 0;
  
  const parsedMarkers = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = parseCSVLine(line);
      let coordinates: LngLatLike | null = null;

      // Process coordinates if they exist
      if (coordinatesIndex >= 0 && values[coordinatesIndex]) {
        coordinates = parseCoordinates(values[coordinatesIndex]);
      }

      const marker = {
        name: nameIndex >= 0 && values[nameIndex] ? values[nameIndex] : 'უსახელო ლოკაცია',
        description: descriptionIndex >= 0 && values[descriptionIndex] ? values[descriptionIndex] : '',
        coordinates,
        google_maps_link: googleMapsLinkIndex >= 0 && values[googleMapsLinkIndex] ? values[googleMapsLinkIndex] : '#'
      };

      if (marker.coordinates) {
        validMarkers++;
        return marker;
      } else {
        skippedMarkers++;
        return null;
      }
    })
    .filter((marker): marker is Marker => marker !== null);

  // Update error state with summary
  if (skippedMarkers > 0) {
    markersError.set(`Processed ${validMarkers} valid markers. Skipped ${skippedMarkers} invalid markers.`);
  } else {
    markersError.set(null);
  }

  return parsedMarkers;
}

// Helper function to properly parse CSV lines that may contain quotes and commas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { // Handle escaped quotes
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  // Clean up any remaining quotes at the start/end of fields
  return result.map(field => field.replace(/^"|"$/g, ''));
}

// Function to fetch markers from Google Sheets
export async function fetchMarkers(): Promise<void> {
  try {
    markersError.set(null); // Reset error state
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vTtH19FvWQJmQ4bsS_iEMws13YvEgPE_6QaUM2k3LV0d0682bYGCTTWYexlHoZLsvQxS8620ROLYaFS/pub?gid=361615453&single=true&output=csv");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch markers: ${response.status}`);
    }
    
    const text = await response.text();
    const parsedMarkers = parseCSV(text);
    markers.set(parsedMarkers);
  } catch (error) {
    markers.set([]);
    markersError.set(error instanceof Error ? error.message : 'Failed to fetch markers');
  }
}