// [{"GroundSpeed":21.74749461138,"Heading":96,"IsDelayed":false,"IsOnRoute":true,"Latitude":40.425215,"Longitude":-79.947068,"Name":"E03","RouteID":91,"Seconds":3,"TimeStamp":"\/Date(1731907361000-0700)\/","VehicleID":12},{"GroundSpeed":0,"Heading":0,"IsDelayed":false,"IsOnRoute":true,"Latitude":40.44859,"Longitude":-79.93366,"Name":"E12","RouteID":102,"Seconds":2,"TimeStamp":"\/Date(1731907362000-0700)\/","VehicleID":3}]

type Bus = {
  GroundSpeed: number;
  Heading: number;
  IsDelayed: boolean;
  IsOnRoute: boolean;
  Latitude: number;
  Longitude: number;
  Name: string;
  RouteID: number;
  Seconds: number;
  TimeStamp: string;
  VehicleID: number;
};
