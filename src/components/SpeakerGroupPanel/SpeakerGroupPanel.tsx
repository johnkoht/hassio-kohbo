import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { getFullImageUrl } from '../../utils/urlUtils';

const PanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const CurrentSongSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: rgba(173, 181, 189, 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
`;

const AlbumArt = styled.div<{ $backgroundImage?: string }>`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-image: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-color: rgba(100, 100, 100, 0.3);
  flex-shrink: 0;
`;

const SongInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SongTitle = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SectionTitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  margin-bottom: 15px;
`;

const EverywhereButton = styled.button<{ $isSelected: boolean }>`
  background: ${props => props.$isSelected ? 'rgba(173, 181, 189, 0.6);' : 'rgba(173, 181, 189, 0.1);'};
  border: none;
  border-radius: 12px;
  padding: 6px 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 15px;
  width: 106px;
`;

const SpeakersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SpeakerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 16px;
  background: rgba(173, 181, 189, 0.1);
  border-radius: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SpeakerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SpeakerName = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin-bottom: 6px;
  display: flex;
`;

const SpeakerStatus = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
`;

const VolumeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
`;

const VolumeSlider = styled.div`
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
`;

const VolumeFill = styled.div<{ $volume: number }>`
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  width: ${props => props.$volume}%;
  transition: width 0.3s ease;
`;

const VolumeText = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  min-width: 28px;
  text-align: right;
`;

const Equalizer = styled.div`
  display: flex;
  align-items: end;
  gap: 2px;
  height: 15px;
  width: 30px;
  margin-left: 10px;
`;

const EqualizerBar = styled.div<{ 
  $height: number; 
  $isAnimated: boolean; 
  $frequency: 'bass' | 'low-mid' | 'mid' | 'high-mid' | 'treble'; 
  $delay: number;
}>`
  width: 1px;
  background: #ffffff;
  border-radius: 1px;
  height: ${props => props.$height}%;
  transition: height 0.2s ease;
  animation: ${props => props.$isAnimated ? `eq-${props.$frequency} ${props.$frequency === 'bass' ? '2s' : props.$frequency === 'treble' ? '0.8s' : '1.2s'} ease-in-out infinite ${props.$delay}s` : 'none'};
  
  @keyframes eq-bass {
    0% { height: ${props => Math.max(props.$height * 0.4, 15)}%; }
    25% { height: ${props => Math.max(props.$height * 0.8, 25)}%; }
    50% { height: ${props => Math.max(props.$height * 0.6, 20)}%; }
    75% { height: ${props => Math.max(props.$height * 0.9, 30)}%; }
    100% { height: ${props => Math.max(props.$height * 0.5, 18)}%; }
  }
  
  @keyframes eq-low-mid {
    0% { height: ${props => Math.max(props.$height * 0.5, 18)}%; }
    30% { height: ${props => Math.max(props.$height * 0.7, 25)}%; }
    60% { height: ${props => Math.max(props.$height * 0.9, 35)}%; }
    100% { height: ${props => Math.max(props.$height * 0.4, 15)}%; }
  }
  
  @keyframes eq-mid {
    0% { height: ${props => Math.max(props.$height * 0.6, 20)}%; }
    40% { height: ${props => Math.max(props.$height * 0.8, 30)}%; }
    80% { height: ${props => Math.max(props.$height * 0.95, 40)}%; }
    100% { height: ${props => Math.max(props.$height * 0.5, 18)}%; }
  }
  
  @keyframes eq-high-mid {
    0% { height: ${props => Math.max(props.$height * 0.4, 15)}%; }
    20% { height: ${props => Math.max(props.$height * 0.85, 35)}%; }
    50% { height: ${props => Math.max(props.$height * 0.6, 22)}%; }
    80% { height: ${props => Math.max(props.$height * 0.9, 38)}%; }
    100% { height: ${props => Math.max(props.$height * 0.3, 12)}%; }
  }
  
  @keyframes eq-treble {
    0% { height: ${props => Math.max(props.$height * 0.3, 12)}%; }
    15% { height: ${props => Math.max(props.$height * 0.7, 28)}%; }
    35% { height: ${props => Math.max(props.$height * 0.4, 16)}%; }
    60% { height: ${props => Math.max(props.$height * 0.8, 32)}%; }
    85% { height: ${props => Math.max(props.$height * 0.5, 20)}%; }
    100% { height: ${props => Math.max(props.$height * 0.6, 24)}%; }
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: #007AFF;
  cursor: pointer;
`;

const ApplyButton = styled.button<{ $isDisabled: boolean }>`
  background: ${props => props.$isDisabled ? 'rgba(173, 181, 189, 0.1)' : 'rgba(173, 181, 189, 0.8)'};
  border: none;
  border-radius: 12px;
  padding: 16px;
  color: ${props => props.$isDisabled ? 'rgba(255, 255, 255, 0.5)' : 'white'};
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  flex-shrink: 0;
`;

interface SpeakerData {
  entityId: string;
  name: string;
  isPlaying?: boolean;
}

interface SpeakerGroupPanelProps {
  primaryEntityId: string;
  onClose: () => void;
}

const SONOS_SPEAKERS: SpeakerData[] = [
  { entityId: 'media_player.sonos_family_room', name: 'Family Room' },
  { entityId: 'media_player.sonos_kitchen', name: 'Kitchen' },
  { entityId: 'media_player.sonos_playroom', name: 'Playroom' },
  { entityId: 'media_player.sonos_living_room', name: 'Dining Room' },
  { entityId: 'media_player.sonos_office', name: 'Office' },
  { entityId: 'media_player.sonos_main_bedroom', name: 'Main Bedroom' },
  { entityId: 'media_player.ninos_room', name: "Nino's Bedroom" },
  { entityId: 'media_player.sonos_basement', name: 'Basement' },
  { entityId: 'media_player.sonos_gazebo', name: 'Gazebo' },
  { entityId: 'media_player.sonos_patio', name: 'Patio' },
  { entityId: 'media_player.sonos_pool', name: 'Pool' },
];

export default function SpeakerGroupPanel({ primaryEntityId, onClose }: SpeakerGroupPanelProps) {
  const primaryEntity = useEntityState(primaryEntityId);
  
  // Call useEntityState for all speakers at the top level
  const familyRoomEntity = useEntityState('media_player.sonos_family_room');
  const kitchenEntity = useEntityState('media_player.sonos_kitchen');
  const playroomEntity = useEntityState('media_player.sonos_playroom');
  const livingRoomEntity = useEntityState('media_player.sonos_living_room');
  const officeEntity = useEntityState('media_player.sonos_office');
  const mainBedroomEntity = useEntityState('media_player.sonos_main_bedroom');
  const ninosRoomEntity = useEntityState('media_player.ninos_room');
  const basementEntity = useEntityState('media_player.sonos_basement');
  const gazeboEntity = useEntityState('media_player.sonos_gazebo');
  const patioEntity = useEntityState('media_player.sonos_patio');
  const poolEntity = useEntityState('media_player.sonos_pool');
  
  const speakerEntities: Record<string, any> = useMemo(() => ({
    'media_player.sonos_family_room': familyRoomEntity,
    'media_player.sonos_kitchen': kitchenEntity,
    'media_player.sonos_playroom': playroomEntity,
    'media_player.sonos_living_room': livingRoomEntity,
    'media_player.sonos_office': officeEntity,
    'media_player.sonos_main_bedroom': mainBedroomEntity,
    'media_player.ninos_room': ninosRoomEntity,
    'media_player.sonos_basement': basementEntity,
    'media_player.sonos_gazebo': gazeboEntity,
    'media_player.sonos_patio': patioEntity,
    'media_player.sonos_pool': poolEntity,
  }), [familyRoomEntity, kitchenEntity, playroomEntity, livingRoomEntity, officeEntity, mainBedroomEntity, ninosRoomEntity, basementEntity, gazeboEntity, patioEntity, poolEntity]);
  
  const [selectedSpeakers, setSelectedSpeakers] = useState<Set<string>>(new Set([primaryEntityId]));
  const [speakerVolumes, setSpeakerVolumes] = useState<Record<string, number>>({});
  const [isApplying, setIsApplying] = useState(false);

  // Current song info
  const mediaTitle = primaryEntity?.attributes?.media_title || 'Unknown Track';
  const mediaArtist = primaryEntity?.attributes?.media_artist || 'Unknown Artist';
  const mediaImageUrl = getFullImageUrl(primaryEntity?.attributes?.entity_picture);

  // Initialize speaker volumes and selection
  useEffect(() => {
    const volumes: Record<string, number> = {};
    SONOS_SPEAKERS.forEach(speaker => {
      const entity = speakerEntities[speaker.entityId];
      volumes[speaker.entityId] = Math.round((entity?.attributes?.volume_level || 0) * 100);
    });
    setSpeakerVolumes(volumes);

    // Set initially selected speakers (current group members)
    const groupMembers = primaryEntity?.attributes?.group_members || [primaryEntityId];
    setSelectedSpeakers(new Set(groupMembers));
  }, [primaryEntity, primaryEntityId, speakerEntities]);

  const handleEverywhereToggle = () => {
    if (selectedSpeakers.size === SONOS_SPEAKERS.length) {
      // Deselect all except primary
      setSelectedSpeakers(new Set([primaryEntityId]));
    } else {
      // Select all speakers
      setSelectedSpeakers(new Set(SONOS_SPEAKERS.map(s => s.entityId)));
    }
  };

  const handleSpeakerToggle = (speakerId: string) => {
    const newSelection = new Set(selectedSpeakers);
    if (speakerId === primaryEntityId) {
      // Can't deselect primary speaker
      return;
    }
    
    if (newSelection.has(speakerId)) {
      newSelection.delete(speakerId);
    } else {
      newSelection.add(speakerId);
    }
    setSelectedSpeakers(newSelection);
  };

  const handleVolumeClick = async (speakerId: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = clickX / rect.width;
    const newVolume = Math.round(clickProgress * 100);

    setSpeakerVolumes(prev => ({ ...prev, [speakerId]: newVolume }));

    try {
      await hassApiFetch('/api/services/media_player/volume_set', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: speakerId,
          volume_level: newVolume / 100,
        }),
      });
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    
    try {
      // Get current group members
      const currentGroupMembers = primaryEntity?.attributes?.group_members || [primaryEntityId];
      const currentSet = new Set(currentGroupMembers);
      
      // Find speakers to join and unjoin
      const speakersToJoin = Array.from(selectedSpeakers).filter(id => !currentSet.has(id));
      const speakersToUnjoin = currentGroupMembers.filter((id: string) => !selectedSpeakers.has(id) && id !== primaryEntityId);
      
      // Unjoin speakers that should be removed
      for (const speakerId of speakersToUnjoin) {
        await hassApiFetch('/api/services/media_player/unjoin', {
          method: 'POST',
          body: JSON.stringify({ entity_id: speakerId }),
        });
      }
      
      // Join speakers that should be added
      if (speakersToJoin.length > 0) {
        await hassApiFetch('/api/services/media_player/join', {
          method: 'POST',
          body: JSON.stringify({ 
            entity_id: speakersToJoin,
            group_members: primaryEntityId
          }),
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to apply speaker grouping:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const generateEqualizerBars = (isPlaying: boolean) => {
    const frequencies: Array<'bass' | 'low-mid' | 'mid' | 'high-mid' | 'treble'> = [
      'bass', 'bass', 'low-mid', 'mid', 'high-mid', 'treble'
    ];
    
    const baseHeights = [70, 60, 80, 75, 65, 50]; // Different base heights for frequency ranges
    const delays = [0, 0.3, 0.6, 0.2, 0.4, 0.1]; // Staggered animation delays
    
    return Array.from({ length: 6 }, (_, i) => (
      <EqualizerBar
        key={i}
        $height={isPlaying ? baseHeights[i] : 10}
        $isAnimated={isPlaying}
        $frequency={frequencies[i]}
        $delay={delays[i]}
      />
    ));
  };

  const isEverywhereSelected = selectedSpeakers.size === SONOS_SPEAKERS.length;
  const hasChanges = selectedSpeakers.size > 0;

  return (
    <PanelContainer>
      <CurrentSongSection>
        <AlbumArt $backgroundImage={mediaImageUrl} />
        <SongInfo>
          <SongTitle>{mediaTitle}</SongTitle>
          <ArtistName>{mediaArtist}</ArtistName>
        </SongInfo>
      </CurrentSongSection>

      <SectionTitle>Select Speakers</SectionTitle>
      
      <EverywhereButton 
        $isSelected={isEverywhereSelected}
        onClick={handleEverywhereToggle}
      >
        Everywhere
      </EverywhereButton>

      <ScrollableContent>
        <SpeakersList>
          {SONOS_SPEAKERS.map(speaker => {
            const entity = speakerEntities[speaker.entityId];
            const isSelected = selectedSpeakers.has(speaker.entityId);
            const isPlaying = entity?.state === 'playing';
            const volume = speakerVolumes[speaker.entityId] || 0;
            const isPrimary = speaker.entityId === primaryEntityId;
            
            return (
              <SpeakerRow key={speaker.entityId}>
                <SpeakerInfo>
                  <SpeakerName>
                    {speaker.name} {isPrimary && '(Primary)'}

                    <Equalizer>
                      {generateEqualizerBars(isPlaying)}
                    </Equalizer>
                  </SpeakerName>
                  {/* <SpeakerStatus>
                    {isPlaying ? 'Playing' : 'Idle'}
                  </SpeakerStatus> */}

                  <VolumeSection>
                    <VolumeSlider onClick={(e) => handleVolumeClick(speaker.entityId, e)}>
                      <VolumeFill $volume={volume} />
                    </VolumeSlider>
                    <VolumeText>{volume}%</VolumeText>
                  </VolumeSection>
                </SpeakerInfo>

                <Checkbox
                  checked={isSelected}
                  disabled={isPrimary}
                  onChange={() => handleSpeakerToggle(speaker.entityId)}
                />
              </SpeakerRow>
            );
          })}
        </SpeakersList>
      </ScrollableContent>

      <ApplyButton 
        $isDisabled={!hasChanges || isApplying}
        onClick={handleApply}
      >
        {isApplying ? 'Applying...' : 'Apply'}
      </ApplyButton>
    </PanelContainer>
  );
} 