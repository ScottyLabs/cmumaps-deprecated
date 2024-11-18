import { Coordinate } from 'mapkit-react';

export type Stop = {
  AddressID: number;
  City: string;
  Latitude: number;
  Longitude: number;
  Description: string;
  Order: number;
  RouteDescription: string;
  RouteID: number;
  RouteStopID: number;
  SecondsAtStop: number;
  SecondsToNextStop: number;
  ShowDefaultedOnMap: boolean;
  ShowEstimatesOnMap: boolean;
  SignVerbiage: string;
};

export type Route = {
  Description: string;
  ETATypeID: number;
  EncodedPolyline: string;
  HideRouteLine: false;
  InfoText: string;
  IsRunning: boolean;
  MapLatitude: number;
  MapLineColor: string;
  MapLongitude: number;
  RouteID: number;
  Stops: Stop[];
};

export type ShuttlePath = {
  routeId: string;
  routeColor: string;
  routePath: Coordinate[];
  routeStops: {
    name: string;
    coordinate: Coordinate;
  }[];
};
