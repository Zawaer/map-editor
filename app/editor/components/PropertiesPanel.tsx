'use client';

import React from 'react';
import { FeatureCollection, Feature } from 'geojson';
import { RoomFeature, FurnitureFeature } from '../lib/types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

interface PropertiesPanelProps {
  selectedFeatureId: string | null;
  selectedFurniture: FurnitureFeature | null;
  rotationInput: number;
  setRotationInput: (value: number) => void;
  updateFurnitureProperties: (properties: Partial<FurnitureFeature['properties']>) => Promise<void>;
  updateRoomProperties: (properties: Partial<RoomFeature['properties']>) => Promise<void>;
  updateFurnitureTransform: (transform: { rotation?: number; scaleX?: number; scaleY?: number }) => void;
  handleExportGeoJSON: () => void;
  roomFeatures: FeatureCollection;
  wallFeatures: FeatureCollection;
  setWallFeatures: React.Dispatch<React.SetStateAction<FeatureCollection>>;
  setRoomFeatures: React.Dispatch<React.SetStateAction<FeatureCollection>>;
  setFurnitureFeatures: React.Dispatch<React.SetStateAction<FeatureCollection>>;
  setSelectedFeatureId: (id: string | null) => void;
  setSelectedFurniture: (furniture: FurnitureFeature | null) => void;
}
export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedFeatureId,
  selectedFurniture,
  rotationInput,
  setRotationInput,
  updateFurnitureProperties,
  updateRoomProperties,
  updateFurnitureTransform,
  handleExportGeoJSON,
  roomFeatures,
  wallFeatures,
  setWallFeatures,
  setRoomFeatures,
  setFurnitureFeatures,
  setSelectedFeatureId,
  setSelectedFurniture,
}) => {
  const selectedFeature = (roomFeatures: FeatureCollection, wallFeatures: FeatureCollection) =>
    roomFeatures.features.find((f) => f.id === selectedFeatureId) ||
    wallFeatures.features.find((f) => f.id === selectedFeatureId) ||
    null;
    wallFeatures.features.find((f) => f.id === selectedFeatureId) ||
    null;

  return (
    <div className="w-64 bg-white dark:bg-gray-900 shadow-md p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Properties</h2>
      {selectedFeatureId && selectedFeature(roomFeatures, wallFeatures)?.properties?.type === 'room' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={selectedFeature(roomFeatures, wallFeatures)?.properties?.name || ''}
              onChange={(e) => updateRoomProperties({ name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room number</label>
            <input
              type="text"
              value={selectedFeature(roomFeatures, wallFeatures)?.properties?.number || ''}
              onChange={(e) => {
                const allowed = /^[0-9\/]*$/;
                if (allowed.test(e.target.value)) {
                  updateRoomProperties({ number: e.target.value });
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={selectedFeature(roomFeatures, wallFeatures)?.properties?.color || '#ff0000'}
              onChange={(e) => updateRoomProperties({ color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={selectedFeature(roomFeatures, wallFeatures)?.properties?.bookable || false}
                onChange={(e) => updateRoomProperties({ bookable: e.target.checked })}
                className="h-4 w-4 text-blue-500"
              />
              Bookable
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={selectedFeature(roomFeatures, wallFeatures)?.properties?.capacity || 0}
              onChange={(e) => updateRoomProperties({ capacity: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input
              type="text"
              value={selectedFeature(roomFeatures, wallFeatures)?.properties?.purpose || ''}
              onChange={(e) => updateRoomProperties({ purpose: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geometry</label>
            <textarea
              value={JSON.stringify(selectedFeature(roomFeatures, wallFeatures)?.geometry, null, 2)}
              onChange={async (e) => {
                try {
                  const newGeometry = JSON.parse(e.target.value);
                  setRoomFeatures((prev) => ({
                    ...prev,
                    features: prev.features.map((f) =>
                      f.id === selectedFeatureId ? { ...f, geometry: newGeometry } : f
                    ),
                  }));
                  const { error } = await supabase
                    .from('rooms')
                    .update({ geometry: newGeometry })
                    .eq('id', selectedFeatureId);
                  if (error) {
                    console.error('Error updating room geometry:', error);
                  }
                } catch (err) {
                  console.error('Invalid JSON for geometry:', err);
                }
              }}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={async () => {
              setRoomFeatures((prev) => ({
                ...prev,
                features: prev.features.filter((f) => f.id !== selectedFeatureId),
              }));
              setSelectedFeatureId(null);
              const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', selectedFeatureId);
              if (error) {
                console.error('Error deleting room:', error);
              }
            }}
            className="mt-5 mb-8 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition font-medium"
          >
            Delete Room
          </button>
        </div>
      )}
      {selectedFurniture && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={selectedFurniture.properties.label || ''}
              onChange={(e) => updateFurnitureProperties({ label: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rotation (degrees)</label>
            <input
              type="number"
              value={rotationInput}
              onChange={(e) => setRotationInput(Number(e.target.value))}
              onBlur={() => updateFurnitureTransform({ rotation: rotationInput })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geometry</label>
            <textarea
              value={JSON.stringify(selectedFurniture?.geometry, null, 2)}
              onChange={async (e) => {
                try {
                  const newGeometry = JSON.parse(e.target.value);
                  setFurnitureFeatures((prev) => ({
                    ...prev,
                    features: prev.features.map((f) =>
                      f.id === selectedFurniture.id ? { ...f, geometry: newGeometry } : f
                    ),
                  }));
                  const { error } = await supabase
                    .from('features')
                    .update({ geometry: newGeometry })
                    .eq('id', selectedFurniture.id);
                  if (error) {
                    console.error('Error updating furniture geometry:', error);
                  }
                } catch (err) {
                  console.error('Invalid JSON for geometry:', err);
                }
              }}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={async () => {
              setFurnitureFeatures((prev) => ({
                ...prev,
                features: prev.features.filter((f) => f.id !== selectedFurniture.id),
              }));
              setSelectedFurniture(null);
              const { error } = await supabase
                .from('features')
                .delete()
                .eq('id', selectedFurniture.id);
              if (error) {
                console.error('Error deleting furniture:', error);
              }
            }}
            className="mt-5 mb-8 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition font-medium"
          >
            Delete Furniture
          </button>
        </div>
      )}
      {selectedFeatureId && selectedFeature(roomFeatures, wallFeatures)?.properties?.type === 'wall' && (
        <button
          onClick={async () => {
            setWallFeatures((prev) => ({
              ...prev,
              features: prev.features.filter((f) => f.id !== selectedFeatureId),
            }));
            setSelectedFeatureId(null);
            const { error } = await supabase
              .from('features')
              .delete()
              .eq('id', selectedFeatureId);
            if (error) {
              console.error('Error deleting wall:', error);
            }
          }}
          className="mt-5 mb-8 w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition font-medium"
        >
          Delete Wall
        </button>
      )}
      {!selectedFeatureId && !selectedFurniture && (
        <p className="text-sm text-gray-500">Select a layer to edit its properties.</p>
      )}
      <button
        onClick={handleExportGeoJSON}
        className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition font-medium"
      >
        Export GeoJSON Files
      </button>
    </div>
  );
};