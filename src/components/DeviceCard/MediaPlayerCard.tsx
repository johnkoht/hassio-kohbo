import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  DeviceCard,
  DeviceCardIcon,
  DeviceCardInfo,
} from './shared';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { getFullImageUrl } from '../../utils/urlUtils';
import { ReactComponent as PlayIcon } from '../../assets/utils/media_player/play.svg';
import { ReactComponent as PauseIcon } from '../../assets/utils/media_player/pause.svg';
import { ReactComponent as PreviousIcon } from '../../assets/utils/media_player/previous.svg';
import { ReactComponent as NextIcon } from '../../assets/utils/media_player/next.svg';
import { ReactComponent as ShuffleIcon } from '../../assets/utils/media_player/shuffle.svg';
import { ReactComponent as RepeatIcon } from '../../assets/utils/media_player/repeat.svg';

const MediaPlayerCardContainer = styled.div<{ $isActive: boolean }>`
  width: 240px;
  height: 320px;
  background: radial-gradient(68.86% 108.57% at 29.04% 31.2%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%), rgba(233, 236, 239, ${props => props.$isActive ? '0.3' : '0.005'});
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
  transform: scale(1);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  gap: 12px;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.16);
  }
  
  &:focus {
    outline: none;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const AlbumArt = styled.div<{ $backgroundImage?: string }>`
  width: 200px;
  height: 140px;
  border-radius: 12px;
  background-image: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
  background-color: rgba(100, 100, 100, 0.3);
  flex-shrink: 0;
  margin-bottom: 10px;
`;

const MediaInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  color: white;
  gap: 4px;
  margin-bottom: 5px;
`;

const TrackTitle = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  cursor: pointer;
`;

const ArtistName = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background: #ADB5BD;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  margin-bottom: 5px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: #F8F9FA;
  border-radius: 2px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const MediaControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ControlButton = styled.button<{ $isActive?: boolean; $buttonType?: 'play' | 'track' | 'mode' }>`
  background: none;
  border: none;
  width: ${props => {
    if (props.$buttonType === 'play') return '28px';
    if (props.$buttonType === 'track') return '16px';
    return '12px'; // mode buttons (shuffle/repeat)
  }};
  height: ${props => {
    if (props.$buttonType === 'play') return '28px';
    if (props.$buttonType === 'track') return '14px';
    return '14px'; // mode buttons (shuffle/repeat)
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

interface MediaPlayerCardProps {
  entityId: string;
  name: string;
}

function getMediaPlayerStateString(entity: any): string {
  if (!entity) return 'Unknown';
  
  const state = entity.state;
  
  switch (state) {
    case 'playing':
      return 'Playing';
    case 'paused':
      return 'Paused';
    case 'idle':
      return 'Idle';
    case 'off':
      return 'Off';
    default:
      return 'Unknown';
  }
}

export default function MediaPlayerCard({ entityId, name }: MediaPlayerCardProps) {
  const entity = useEntityState(entityId);
  const { openModal } = useModal();
  const [currentPosition, setCurrentPosition] = useState(0);

  const isPlaying = entity?.state === 'playing';
  const isPaused = entity?.state === 'paused';
  const isActive = isPlaying || isPaused;

  // Media attributes
  const mediaTitle = entity?.attributes?.media_title || 'Unknown Track';
  const mediaArtist = entity?.attributes?.media_artist || 'Unknown Artist';
  const mediaAlbumName = entity?.attributes?.media_album_name || '';
  const mediaImageUrl = getFullImageUrl(entity?.attributes?.entity_picture);
  const volumeLevel = entity?.attributes?.volume_level || 0;
  const mediaDuration = entity?.attributes?.media_duration || 0;
  const mediaPosition = entity?.attributes?.media_position || 0;
  const mediaPositionUpdatedAt = entity?.attributes?.media_position_updated_at;
  const isShuffled = entity?.attributes?.shuffle || false;
  const repeatMode = entity?.attributes?.repeat || 'off';

  // Calculate actual current position using media_position and media_position_updated_at
  const calculateCurrentPosition = React.useCallback(() => {
    if (!mediaPositionUpdatedAt || !isPlaying) {
      return mediaPosition;
    }

    // Parse the timestamp and calculate elapsed time
    const updatedAt = new Date(mediaPositionUpdatedAt);
    const now = new Date();
    const elapsedSeconds = (now.getTime() - updatedAt.getTime()) / 1000;
    
    // Add elapsed time to the reported position
    const calculatedPosition = mediaPosition + elapsedSeconds;
    
    // Don't exceed the duration
    return Math.min(calculatedPosition, mediaDuration);
  }, [mediaPosition, mediaPositionUpdatedAt, isPlaying, mediaDuration]);

  // Update current position when entity changes or when calculating
  React.useEffect(() => {
    setCurrentPosition(calculateCurrentPosition());
  }, [calculateCurrentPosition]); 

  // Reset position when track changes
  React.useEffect(() => {
    setCurrentPosition(0);
  }, [mediaTitle]);

  // Update position in real-time when playing
  React.useEffect(() => {
    if (!isPlaying || mediaDuration === 0) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentPosition(calculateCurrentPosition());
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, mediaDuration, calculateCurrentPosition]);

  // Calculate progress percentage using currentPosition state
  const progress = mediaDuration > 0 ? (currentPosition / mediaDuration) * 100 : 0;

  // Debug logging for troubleshooting
  React.useEffect(() => {
    if (entity) {
      const updatedAt = mediaPositionUpdatedAt ? new Date(mediaPositionUpdatedAt) : null;
      const now = new Date();
      const elapsedSinceUpdate = updatedAt ? (now.getTime() - updatedAt.getTime()) / 1000 : 0;
      
      console.log('MediaPlayer Full Debug:', {
        entityId,
        state: entity.state,
        allAttributes: entity.attributes,
        mediaTitle,
        entityMediaPosition: mediaPosition,
        mediaPositionUpdatedAt,
        elapsedSinceUpdate: Math.round(elapsedSinceUpdate),
        currentPosition,
        mediaDuration,
        progress: Math.round(progress),
        entityPositionFormatted: `${Math.floor(mediaPosition / 60)}:${Math.floor(mediaPosition % 60).toString().padStart(2, '0')}`,
        currentPositionFormatted: `${Math.floor(currentPosition / 60)}:${Math.floor(currentPosition % 60).toString().padStart(2, '0')}`,
        durationFormatted: `${Math.floor(mediaDuration / 60)}:${Math.floor(mediaDuration % 60).toString().padStart(2, '0')}`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [entity, entityId, mediaTitle, mediaPosition, mediaPositionUpdatedAt, currentPosition, mediaDuration, progress]);

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isPlaying) {
        await hassApiFetch('/api/services/media_player/media_pause', {
          method: 'POST',
          body: JSON.stringify({ entity_id: entityId }),
        });
      } else {
        await hassApiFetch('/api/services/media_player/media_play', {
          method: 'POST',
          body: JSON.stringify({ entity_id: entityId }),
        });
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
    }
  };



  const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
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
      setCurrentPosition(seekTime);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal('media_player', `${entityId}|${name}`);
  };

  const handleAlbumArtClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal('media_player', `${entityId}|${name}`);
  };

  const handleCardClick = () => {
    // Card background click - could do nothing or open modal
    openModal('media_player', `${entityId}|${name}`);
  };

  const handleShuffle = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handlePrevious = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await hassApiFetch('/api/services/media_player/media_previous_track', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to skip to previous track:', error);
    }
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await hassApiFetch('/api/services/media_player/media_next_track', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to skip to next track:', error);
    }
  };

  const handleRepeat = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <MediaPlayerCardContainer $isActive={isActive} onClick={handleCardClick}>
      <AlbumArt $backgroundImage={mediaImageUrl} onClick={handleAlbumArtClick} />
      <MediaInfo>
        <TrackTitle onClick={handleTitleClick}>{mediaTitle}</TrackTitle>
        <ArtistName>{mediaArtist}</ArtistName>
      </MediaInfo>
      <ProgressBar onClick={handleProgressClick}>
        <ProgressFill $progress={progress} />
      </ProgressBar>
      <MediaControls>
        <ControlButton $isActive={isShuffled} $buttonType="mode" onClick={handleShuffle}>
          <ShuffleIcon />
        </ControlButton>
        <ControlButton $buttonType="track" onClick={handlePrevious}>
          <PreviousIcon />
        </ControlButton>
        <ControlButton $buttonType="play" onClick={handlePlayPause}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </ControlButton>
        <ControlButton $buttonType="track" onClick={handleNext}>
          <NextIcon />
        </ControlButton>
        <ControlButton $isActive={repeatMode !== 'off'} $buttonType="mode" onClick={handleRepeat}>
          <RepeatIcon />
        </ControlButton>
      </MediaControls>
    </MediaPlayerCardContainer>
  );
} 