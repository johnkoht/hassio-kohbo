import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import ModalHeader from './shared/ModalHeader';
import VerticalSlider from '../VerticalSlider/VerticalSlider';
import ActionGrid, { ActionItem } from '../ActionGrid/ActionGrid';
import { ReactComponent as PlayIcon } from '../../assets/device_icons/spotify.svg';
import { ReactComponent as PauseIcon } from '../../assets/device_icons/netflix.svg';
import { ReactComponent as ShuffleIcon } from '../../assets/device_icons/hulu.svg';
import { ReactComponent as RepeatIcon } from '../../assets/device_icons/disney.svg';

const ModalContent = styled.div`
  padding: 20px;
  color: white;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const AlbumArtSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const AlbumArt = styled.div<{ $backgroundImage?: string }>`
  width: 200px;
  height: 200px;
  border-radius: 12px;
  background-image: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-color: rgba(100, 100, 100, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const TrackInfo = styled.div`
  text-align: center;
  max-width: 300px;
`;

const TrackTitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistName = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #CED4DA;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AlbumName = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #6C757D;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MediaControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const ControlButton = styled.button<{ $isPrimary?: boolean }>`
  background: ${props => props.$isPrimary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: ${props => props.$isPrimary ? '60px' : '48px'};
  height: ${props => props.$isPrimary ? '60px' : '48px'};
  color: white;
  font-size: ${props => props.$isPrimary ? '24px' : '18px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
`;

const TimeDisplay = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #CED4DA;
  min-width: 40px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const VolumeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const VolumeLabel = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #CED4DA;
  min-width: 60px;
`;

const VolumeValue = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  min-width: 40px;
  text-align: right;
`;

const GroupingSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const GroupingLabel = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #CED4DA;
`;

const GroupingButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

interface MediaPlayerModalProps {
  entityId: string;
  name: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MediaPlayerModal({ entityId, name }: MediaPlayerModalProps) {
  const { closeModal } = useModal();
  const entity = useEntityState(entityId);
  const [volume, setVolume] = useState(50);
  const [isUpdatingVolume, setIsUpdatingVolume] = useState(false);

  const isPlaying = entity?.state === 'playing';
  const isPaused = entity?.state === 'paused';
  const isShuffled = entity?.attributes?.shuffle || false;
  const repeatMode = entity?.attributes?.repeat || 'off';

  // Media attributes
  const mediaTitle = entity?.attributes?.media_title || 'Unknown Track';
  const mediaArtist = entity?.attributes?.media_artist || 'Unknown Artist';
  const mediaAlbumName = entity?.attributes?.media_album_name || '';
  const mediaImageUrl = entity?.attributes?.entity_picture;
  const volumeLevel = entity?.attributes?.volume_level || 0;
  const mediaDuration = entity?.attributes?.media_duration || 0;
  const mediaPosition = entity?.attributes?.media_position || 0;
  const groupMembers = entity?.attributes?.group_members || [];

  // Calculate progress percentage
  const progress = mediaDuration > 0 ? (mediaPosition / mediaDuration) * 100 : 0;

  // Update volume when entity state changes
  React.useEffect(() => {
    if (isUpdatingVolume) return;
    
    if (entity?.attributes?.volume_level !== undefined) {
      const newVolume = Math.round(entity.attributes.volume_level * 100);
      setVolume(newVolume);
    }
  }, [entity, isUpdatingVolume]);

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
  }, []);

  const handleVolumeRelease = useCallback(async (value: number) => {
    setIsUpdatingVolume(true);
    
    try {
      await hassApiFetch('/api/services/media_player/volume_set', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: entityId,
          volume_level: value / 100,
        }),
      });
      
      setTimeout(() => {
        setIsUpdatingVolume(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to set volume:', error);
      setIsUpdatingVolume(false);
    }
  }, [entityId]);

  const handlePlayPause = async () => {
    try {
      const service = isPlaying ? 'media_player/media_pause' : 'media_player/media_play';
      await hassApiFetch(`/api/services/${service}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };

  const handlePrevious = async () => {
    try {
      await hassApiFetch('/api/services/media_player/media_previous_track', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to skip to previous track:', error);
    }
  };

  const handleNext = async () => {
    try {
      await hassApiFetch('/api/services/media_player/media_next_track', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to skip to next track:', error);
    }
  };

  const handleShuffle = async () => {
    try {
      await hassApiFetch('/api/services/media_player/shuffle_set', {
        method: 'POST',
        body: JSON.stringify({ 
          entity_id: entityId, 
          shuffle: !isShuffled 
        }),
      });
    } catch (error) {
      console.error('Failed to toggle shuffle:', error);
    }
  };

  const handleRepeat = async () => {
    try {
      const newRepeatMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
      await hassApiFetch('/api/services/media_player/repeat_set', {
        method: 'POST',
        body: JSON.stringify({ 
          entity_id: entityId, 
          repeat: newRepeatMode 
        }),
      });
    } catch (error) {
      console.error('Failed to toggle repeat:', error);
    }
  };

  const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = clickX / rect.width;
    const seekTime = clickProgress * mediaDuration;

    try {
      await hassApiFetch('/api/services/media_player/media_seek', {
        method: 'POST',
        body: JSON.stringify({ 
          entity_id: entityId, 
          seek_position: seekTime 
        }),
      });
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleGrouping = () => {
    // Placeholder for grouping functionality
    console.log('Grouping functionality - to be implemented');
  };

  return (
    <ModalContent>
      <ModalHeader 
        title={name}
        onClose={closeModal}
        centered={true}
        marginBottom="20px"
      />

      <AlbumArtSection>
        <AlbumArt $backgroundImage={mediaImageUrl} />
        <TrackInfo>
          <TrackTitle>{mediaTitle}</TrackTitle>
          <ArtistName>{mediaArtist}</ArtistName>
          {mediaAlbumName && <AlbumName>{mediaAlbumName}</AlbumName>}
        </TrackInfo>
      </AlbumArtSection>

      <ControlsSection>
        <MediaControls>
          <ControlButton onClick={handleShuffle}>
            🔀
          </ControlButton>
          <ControlButton onClick={handlePrevious}>
            ⏮
          </ControlButton>
          <ControlButton $isPrimary onClick={handlePlayPause}>
            {isPlaying ? '⏸' : '▶'}
          </ControlButton>
          <ControlButton onClick={handleNext}>
            ⏭
          </ControlButton>
          <ControlButton onClick={handleRepeat}>
            🔁
          </ControlButton>
        </MediaControls>

        <ProgressSection>
          <TimeDisplay>{formatTime(mediaPosition)}</TimeDisplay>
          <ProgressBar onClick={handleProgressClick}>
            <ProgressFill $progress={progress} />
          </ProgressBar>
          <TimeDisplay>{formatTime(mediaDuration)}</TimeDisplay>
        </ProgressSection>

        <VolumeSection>
          <VolumeLabel>Volume</VolumeLabel>
          <VerticalSlider
            value={volume}
            onChange={handleVolumeChange}
            onRelease={handleVolumeRelease}
          />
          <VolumeValue>{volume}%</VolumeValue>
        </VolumeSection>

        <GroupingSection>
          <GroupingLabel>Speaker Groups</GroupingLabel>
          <GroupingButton onClick={handleGrouping}>
            🏠 Manage Groups ({groupMembers.length} speakers)
          </GroupingButton>
        </GroupingSection>
      </ControlsSection>
    </ModalContent>
  );
} 