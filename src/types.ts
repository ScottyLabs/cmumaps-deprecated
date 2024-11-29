/**
 * Contains TypeScript type definitions used in the project.
 */
import { Coordinate } from 'mapkit-react';

export type RoomId = string;
export type BuildingCode = string;
export type FloorLevel = string;

/**
 * An absolute coordinate.
 */
export type AbsoluteCoordinate = { x: number; y: number };

/**
 * Room types
 */
export const RoomTypeList = [
  'Default',
  'Corridor',
  'Auditorium',
  'Office',
  'Classroom',
  'Operational', // Used for storage or maintenance, not publicly accessible
  'Conference',
  'Study',
  'Library Study Room',
  'Laboratory',
  'Computer Lab',
  'Studio',
  'Workshop',
  'Vestibule',
  'Storage',
  'Restroom',
  'Stairs',
  'Elevator',
  'Ramp',
  'Dining',
  'Food',
  'Store',
  'Library',
  'Sport',
  'Parking',
  'Inaccessible',
  '', // not assigned
] as const;

export type RoomType = (typeof RoomTypeList)[number];

/**
 * The attributes of a room type.
 */
interface RoomTypeDetails {
  /**
   * A CSS color used for the marker of the room
   */
  primary: string;

  /**
   * A CSS color used for the background of the room’s shape
   */
  background: string;

  /**
   * A CSS color used for the border of the room’s shape
   */
  border: string;
}

/**
 * Returns the attributes of a room type
 * @param type The type of the room
 * @returns See RoomTypeDetails
 */
export function getRoomTypeDetails(type: RoomType): RoomTypeDetails {
  switch (type) {
    case 'Default':
      return { primary: '#b5b3b2', background: '#eeeeee', border: '#cccccc' };
    case 'Corridor':
      return { primary: '#cecece', background: '#fefefe', border: '#cccccc' };
    case 'Office':
      return { primary: '#b5b3b2', background: '#eeeeee', border: '#cccccc' };
    case 'Auditorium':
    case 'Classroom':
    case 'Conference':
      return { primary: '#7082b3', background: '#e6ecfe', border: '#9eabcd' };
    case 'Operational':
    case 'Storage':
      return { primary: '#808080', background: '#ece3d5', border: '#b9b9b9' };
    case 'Laboratory':
    case 'Computer Lab':
    case 'Studio':
    case 'Workshop':
      return { primary: '#ff7e81', background: '#ffdbdc', border: '#ff7e81' };
    case 'Vestibule':
      return { primary: '#cecece', background: '#fefefe', border: '#cccccc' };
    case 'Restroom':
      return { primary: '#c39dff', background: '#e7dfed', border: '#d6d0db' };
    case 'Stairs':
    case 'Elevator':
    case 'Ramp':
      return { primary: '#3b92f0', background: '#c4dadf', border: '#9bacb0' };
    case 'Dining':
      return { primary: '#ff961c', background: '#ffdcb2', border: '#f8992a' };
    case 'Food':
      return { primary: '#ff961c', background: '#ffdcb2', border: '#f8992a' };
    case 'Store':
      return { primary: '#ffc855', background: '#fff0d0', border: '#ffc855' };
    case 'Library':
    case 'Study':
      return { primary: '#d18e63', background: '#f5dbc8', border: '#d18e63' };
    case 'Sport':
      return { primary: '#6bc139', background: '#e1fcd1', border: '#9ac382' };
    case 'Parking':
      return { primary: '#51a2f7', background: '#d4e9ff', border: '#51a2f7' };
    default:
      return { primary: '#b5b3b2', background: '#eeeeee', border: '#cccccc' };
  }
}

export interface SearchRoom {
  /**
   * Unique ID (UUID)
   */
  id: RoomId;

  /**
   * The short name of the room, without the building name but including the
   * floor level (e.g. '121' for CUC 121)
   */
  name: string;

  /**
   * A list of names under which the room is known for searching purposes (e.g. 'ABP vs Au Bon Pain')
   */
  aliases: string[];

  alias: string;

  type: RoomType;

  labelPosition: Coordinate;

  floor: Floor;
}

export interface Room {
  /**
   * Unique ID (UUID)
   */
  id: RoomId;

  /**
   * Building-Floor code (e.g. 'WEH-4')
   */
  floor: Floor;

  /**
   * even-odd included-not-included 2darray of coordinates to polygon
   */
  // polygon: Polygon;

  /**
   * coordinates to be displayed in floorPlanView polygon
   */
  coordinates: Coordinate[][];

  /**
   * The short name of the room, without the building name but including the
   * floor level (e.g. '121' for CUC 121)
   */
  name: string;

  /**
   * Another name under which the room is known (e.g. 'McConomy Auditorium')
   */
  alias: string | undefined;

  type: RoomType;

  labelPosition: Coordinate;
}

/**
 * The placement of a SVG building in the real world.
 */
export interface Placement {
  /**
   * The coordinate of the building's bounding box center.
   */
  center: Coordinate;

  /**
   * The scale of the building (how many SVG units in a meter).
   */
  scale: number;

  /**
   * The angle, in degrees, at which the building is rotated.
   */
  angle: number;
}

export const areFloorsEqual = (floor1: Floor, floor2: Floor) => {
  return (
    floor1.buildingCode == floor2.buildingCode && floor1.level == floor2.level
  );
};

/**
 * A floor in a building.
 */
export interface Floor {
  buildingCode: string;
  level: FloorLevel;
}

/**
 * Details about a specific building floor.
 */
export type FloorPlan = Record<RoomId, Room>;

/**
 * The details of a building.
 */
export interface Building {
  /**
   * The code of the building (e.g. 'WEH')
   */
  code: string;

  /**
   * The name of the buliding (e.g. 'Wean Hall')
   */
  name: string;

  /**
   * A list of floor levels in the building.
   */
  floors: FloorLevel[];

  /**
   * The name of the floor displayed by default for this building.
   */
  defaultFloor: string;

  /**
   * The ordinal of the default floor (the ordinal of the Cut is 0)
   */
  defaultOrdinal: number;

  /**
   * The position of the label for the building's code.
   */
  labelPosition: Coordinate;

  /**
   * The shapes that the building consists of.
   */
  shapes: Coordinate[][];

  /**
   * The zone in which the building is considered to be the primary building.
   */
  hitbox: Coordinate[] | null;
}

/**
 * A map from building code to a map of floor levels to a list of search rooms
 * Used for searching purposes
 */
export type SearchMap = Record<BuildingCode, Record<FloorLevel, SearchRoom[]>>;

export type FloorPlanMap = Record<BuildingCode, Record<FloorLevel, FloorPlan>>;

export type LocationState =
  | 'OPEN'
  | 'CLOSES_SOON'
  | 'OPENS_SOON'
  | 'CLOSED'
  | 'CLOSED_LONG_TERM';

// conceptId of the eatery
export type EateryId = number;
export interface EateryInfo {
  name: string;
  url: string;
  shortDescription: string;
  statusMsg: string;
  locationState: LocationState;
  hoursUntilStateChange: number;
}

export type EateryData = Record<EateryId, EateryInfo>;

export type Department = string;
export type CourseCode = string;
export type CourseData = Record<Department, Record<CourseCode, Course>>;
export interface Course {
  name: string;
  sections: Record<string, CourseSection>;
}
export interface CourseSection {
  room: string;
  dow: string;
  startTime: string;
  endTime: string;
}
