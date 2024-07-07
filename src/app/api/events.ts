import { retrieveEvents } from './query';
import type { NextApiRequest, NextApiResponse } from 'next';

const buildingNameMap = new Map([
  ['DH', 'DH-WEH'],
  ['TEP', 'TEP'],
  ['CUC', 'CUC'],
  ['HBH', 'HBH'],
  ['MI', 'MI'],
  ['POS', 'POS-MM'],
  ['MM', 'POS-MM'],
  ['DH', 'DH-WEH'],
  ['WEH', 'DH-WEH'],
  ['HH', 'HH-SH'],
  ['SH', 'HH-SH'],
  ['BH', 'BH-PH'],
  ['PH', 'BH-PH'],
  ['GHC', 'GHC'],
  ['HL', 'HL'],
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const buildingName = buildingNameMap.get(req.body.building);
  const roomName = req.body.building + ' ' + req.body.room;
  const date = req.body.date;
  if (!buildingName || !roomName) {
    return res.status(404);
  }
  const events = await retrieveEvents(roomName, date);
  console.log(events);
  return res.status(200).json(events);
}
