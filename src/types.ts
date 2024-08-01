/**
 * Contains TypeScript type definitions used in the project.
 */

import { Coordinate } from 'mapkit-react';

/**
 * An absolute coordinate.
 */
export type AbsoluteCoordinate = [number, number];

/**
 * Room types
 */
export type RoomType =
  | 'default'
  | 'corridor'
  | 'auditorium'
  | 'office'
  | 'classroom'
  | 'operational' // Used for storage or maintenance, not publicly accessible
  | 'conference'
  | 'study'
  | 'laboratory'
  | 'computer lab'
  | 'studio'
  | 'workshop'
  | 'vestibule'
  | 'storage'
  | 'restroom'
  | 'stairs'
  | 'elevator'
  | 'ramp'
  | 'dining'
  | 'store'
  | 'library'
  | 'sport'
  | 'parking';

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
    case 'default':
      return { primary: '#b5b3b2', background: '#eeeeee', border: '#cccccc' };
    case 'corridor':
      return { primary: '#cecece', background: '#fefefe', border: '#cccccc' };
    case 'office':
      return { primary: '#b5b3b2', background: '#eeeeee', border: '#cccccc' };
    case 'auditorium':
    case 'classroom':
    case 'conference':
      return { primary: '#7082b3', background: '#e6ecfe', border: '#9eabcd' };
    case 'operational':
    case 'storage':
      return { primary: '#808080', background: '#ece3d5', border: '#b9b9b9' };
    case 'laboratory':
    case 'computer lab':
    case 'studio':
    case 'workshop':
      return { primary: '#ff7e81', background: '#ffdbdc', border: '#ff7e81' };
    case 'vestibule':
      return { primary: '#cecece', background: '#fefefe', border: '#cccccc' };
    case 'restroom':
      return { primary: '#c39dff', background: '#e7dfed', border: '#d6d0db' };
    case 'stairs':
    case 'elevator':
    case 'ramp':
      return { primary: '#3b92f0', background: '#c4dadf', border: '#9bacb0' };
    case 'dining':
      return { primary: '#ff961c', background: '#ffdcb2', border: '#f8992a' };
    case 'store':
      return { primary: '#ffc855', background: '#fff0d0', border: '#ffc855' };
    case 'library':
    case 'study':
      return { primary: '#d18e63', background: '#f5dbc8', border: '#d18e63' };
    case 'sport':
      return { primary: '#6bc139', background: '#e1fcd1', border: '#9ac382' };
    case 'parking':
      return { primary: '#51a2f7', background: '#d4e9ff', border: '#51a2f7' };
    default:
      return { primary: '#b5b3b2', background: '#eeeeee', border: '#cccccc' };
  }
}
export interface Polygon {
  coordinates: AbsoluteCoordinate[][];
  type: string;
}

export interface SearchRoom {
  /**
   * Unique ID (UUID)
   */
  id?: string;

  /**
   * The short name of the room, without the building name but including the
   * floor level (e.g. '121' for CUC 121)
   */
  name: string;

  /**
   * Another name under which the room is known (e.g. 'McConomy Auditorium')
   */
  alias?: string;

  type: RoomType;
}

export interface Room {
  /**
   * Unique ID (UUID)
   */
  id: string;

  /**
   * Building-Floor code (e.g. 'WEH-4')
   */
  floor: string;

  /**
   * even-odd included-not-included 2darray of coordinates to polygon
   */
  polygon: Polygon;

  /**
   * The short name of the room, without the building name but including the
   * floor level (e.g. '121' for CUC 121)
   */
  name: string;

  /**
   * Another name under which the room is known (e.g. 'McConomy Auditorium')
   */
  alias?: string;

  type: RoomType;

  labelPosition?: AbsoluteCoordinate;
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

/**
 * A floor in a building.
 */
export interface Floor {
  buildingCode: string;
  level: string;
}

/**
 * Details about a specific building floor.
 */
export interface FloorPlan {
  placement: Placement;
  rooms: Room[];
}

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
   * The floors in the building.
   */
  floors: { name: string; ordinal: number }[];

  /**
   * The name of the floor displayed by default for this building.
   */
  defaultFloor: string;

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
 * A map from floor identifiers (e.g. 'WEH-4') to floor plans.
 */
export type FloorMap = { [code: string]: FloorPlan };

/**
 * The structure of the export file containing the CMU Map data.
 */
export interface Export {
  buildings: Building[];
  floors: FloorMap;
}
