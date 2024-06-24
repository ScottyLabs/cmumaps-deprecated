import React, { useState, useMemo } from 'react';
import styles from '@/styles/Toolbar.module.css';
import {
  MagnifyingGlassIcon, ArrowLeftIcon,
} from '@heroicons/react/24/solid';
import FloorSwitcher from '@/components/FloorSwitcher';
import {
  AbsoluteCoordinate,
  Building,
  Floor,
  FloorMap,
  Room,
} from '@/types';
import clsx from 'clsx';
import useEscapeKey from '@/hooks/useEscapeKey';
import SearchResults from './SearchResults';
import InfoCard from '@/components/InfoCard';
import QuickSearch from '@/components/QuickSearch';
import NavCard from './NavCard';
import { Door } from '@/pages/api/findPath';

export interface ToolbarProps {
  buildings: Building[] | null;
  floorMap: FloorMap;
  activeBuilding: Building | null;
  floorOrdinal: number | null;
  setFloorOrdinal: (newOrdinal: number | null) => void;
  onSelectBuilding: (newBuilding: Building | null) => void;
  onSelectRoom: (selectedRoom: Room, building: Building, floor: Floor) => void;
  isSearchOpen: boolean;
  onSetIsSearchOpen: (newValue: boolean) => void;
  buildingAndRoom: {building: Building | null, room: Room | null};
  isCardOpen: boolean;
  setIsCardOpen: (n: boolean)=>void;
  isNavOpen: boolean;
  setIsNavOpen: (newValue: boolean) => void;
  userPosition: AbsoluteCoordinate;
  setNavERoom: (newValue: Room) => void;
  setNavSRoom: (newValue: Room) => void;
  navERoom: Room;
  navSRoom: Room;
  setRecommendedPath: (n: Door[]) => void
}

/**
 * Contains the floor switcher, the search bar and the search results.
 */
export default function Toolbar({
  buildings,
  floorMap,
  activeBuilding,
  floorOrdinal,
  setFloorOrdinal,
  onSelectBuilding,
  onSelectRoom,
  isSearchOpen,
  onSetIsSearchOpen,
  buildingAndRoom,
  isCardOpen,
  setIsCardOpen,
  isNavOpen,
  setIsNavOpen,
  userPosition,
  setNavERoom,
  setNavSRoom,
  navERoom, 
  navSRoom,
  setRecommendedPath
}: ToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');


  useMemo(()=>{
    if(!isCardOpen)
      return setSearchQuery("")

    let formattedName = ""
    if(buildingAndRoom.room?.alias)
      return setSearchQuery(buildingAndRoom.room?.alias)

    if(buildingAndRoom.building?.name){
      formattedName += buildingAndRoom.building?.name 
    }
    if (buildingAndRoom.room?.name){
      formattedName += " " + buildingAndRoom.room?.name
    }else{
      formattedName == ""
    }
    if(formattedName != "")
      setSearchQuery(formattedName)
    
  }, [buildingAndRoom, isCardOpen])
  useEscapeKey(() => {
    onSetIsSearchOpen(false);
  });

  return (
    <>
      <div
        className={clsx(
          styles.toolbar,
          (isSearchOpen) && styles['toolbar-open'],
          (isCardOpen) && styles['card-open'],
        )}
      > 
      {!isNavOpen && isCardOpen && <InfoCard 
      building={buildingAndRoom.building} 
      room={buildingAndRoom.room} 
      isCardOpen={isCardOpen && !isSearchOpen} 
      setNavSRoom={setNavSRoom}
      setNavERoom={setNavERoom}
      setIsNavOpen={setIsNavOpen}
      />}
      {isNavOpen && <NavCard 
      sroom={navSRoom} 
      eroom={navERoom} 
      setRecommendedPath={setRecommendedPath}
      />}
        {activeBuilding && !isCardOpen && (
          <FloorSwitcher
            building={activeBuilding}
            ordinal={floorOrdinal!}
            isToolbarOpen={isSearchOpen}
            onOrdinalChange={setFloorOrdinal}
          />
        )}

        <div className={styles['search-box']}>
          <div className={styles['search-icon-wrapper']}>
            <MagnifyingGlassIcon className={styles['search-icon']} />
          </div>
          <button
            type="button"
            title="Close"
            className={clsx(
              styles['search-close-button'],
              (isSearchOpen || isCardOpen || isNavOpen) && styles['search-close-button-visible'],
            )}
            ref={(node) => node && (
              (isSearchOpen || isCardOpen || isNavOpen) ? node.removeAttribute('inert') : node.setAttribute('inert', '')
            )}
            onClick={() => {
              onSetIsSearchOpen(false);
              setIsNavOpen(false);
              setRecommendedPath([]);
              setIsCardOpen(false);
            }}
          >
            <ArrowLeftIcon className={styles['search-close-icon']} />
          </button>
          {!isSearchOpen && (
            <button
              type="button"
              aria-label="Open Search"
              className={clsx(
                styles['open-search-button'],
                !searchQuery && styles.placeholder,
              )}
              onClick={() => {
                onSetIsSearchOpen(true);
                // inputRef.current!.focus();
              }}
            >
              {searchQuery === '' ? 'Search' : searchQuery}
            </button>
          )}
        </div>
        
      </div>
      {isSearchOpen && (
        <input
          type="search"
          className={clsx(
            styles['search-box-input'],
          )}
          placeholder="Search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
          }}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          title="Search query"
        />
      )}

      <div
        className={clsx(
          styles['search-modal-background'],
          isSearchOpen && styles['search-modal-background-active'],
        )}
        role="presentation"
      />

      <div
        className={clsx(
          styles['search-modal'],
          isSearchOpen && styles['search-modal-open'],
        )}
        ref={(node) => node && (
          isSearchOpen ? node.removeAttribute('inert') : node.setAttribute('inert', '')
        )}
      >
        
        {buildings && searchQuery != "" && (
        <div className={styles['search-list']}>
          <div className={styles['search-list-scroll']}>
              <SearchResults
                query={searchQuery}
                buildings={buildings}
                floorMap={floorMap}
                onSelectBuilding={(building: Building) => {
                  onSelectBuilding(building);
                  onSetIsSearchOpen(false);
                }}
                onSelectRoom={(room: Room, building: Building, newFloor: Floor) => {
                  onSelectRoom(room, building, newFloor);
                  onSetIsSearchOpen(false);
                }}
                userPosition={userPosition}
              />
          </div>          
        </div>
          )}
          {buildings && searchQuery == "" && (
              <QuickSearch
                setQuery={setSearchQuery}
              />
            )}
            
      </div>
      
    </>
  );
}
