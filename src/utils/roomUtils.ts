// Map routes to room identifiers used in presence sensors
export const ROUTE_TO_ROOM_MAP: Record<string, string> = {
  '/kitchen': 'kitchen',
  '/office': 'office',
  '/family-room': 'family_room',
  '/playroom': 'playroom',
  '/foyer': 'mudroom', // Assuming foyer maps to mudroom in sensors
  '/main-bedroom': 'main_bedroom',
  '/jr-suite': 'jr_suite',
  '/gianlucas-bedroom': 'gianluca_room', // Fixed: was 'gianlucas_bedroom'
  '/ninos-bedroom': 'nino_bedroom', // Fixed: was 'ninos_bedroom'
  // Add more rooms as you create dashboards for them:
  // '/basement': 'basement',
  // '/garage': 'garage',
  // '/gazebo': 'gazebo',
  // '/living-room': 'living_room',
  // '/sunroom': 'sunroom',
  // '/upstairs-guest-bedroom': 'upstairs_guest_bedroom',
};

export function getCurrentRoomFromPath(pathname: string): string | null {
  return ROUTE_TO_ROOM_MAP[pathname] || null;
} 