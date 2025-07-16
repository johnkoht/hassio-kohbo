import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { getFullImageUrl } from '../../utils/urlUtils';
import ModalHeader from './shared/ModalHeader';
import SlidingModal from '../SlidingModal';
import SpeakerGroupPanel from '../SpeakerGroupPanel';
import { ReactComponent as PlayIcon } from '../../assets/utils/media_player/play.svg';
import { ReactComponent as PauseIcon } from '../../assets/utils/media_player/pause.svg';
import { ReactComponent as PreviousIcon } from '../../assets/utils/media_player/previous.svg';
import { ReactComponent as NextIcon } from '../../assets/utils/media_player/next.svg';
import { ReactComponent as ShuffleIcon } from '../../assets/utils/media_player/shuffle.svg';
import { ReactComponent as RepeatIcon } from '../../assets/utils/media_player/repeat.svg';
import { ReactComponent as MuteIcon } from '../../assets/utils/media_player/mute.svg';
import { ReactComponent as SoundIcon } from '../../assets/utils/media_player/sound.svg';

const ModalContent = styled.div`
  padding: 20px;
  color: white;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
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
  align-items: center;
`;

const MediaControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin: 15px 0;
  width: 300px;
`;

const ControlButton = styled.button<{ $isPrimary?: boolean; $isActive?: boolean; $buttonType?: 'play' | 'track' | 'mode' }>`
  background: none;
  border: none;
  width: ${props => {
    if (props.$isPrimary || props.$buttonType === 'play') return '40px';
    if (props.$buttonType === 'track') return '28px';
    return '22px'; // mode buttons (shuffle/repeat)
  }};
  height: ${props => {
    if (props.$isPrimary || props.$buttonType === 'play') return '40px';
    if (props.$buttonType === 'track') return '28px';
    return '22px'; // mode buttons (shuffle/repeat)
  }};
  color: ${props => props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }

  &:first-child {
    right-right: 15px;
  }
  
  &:last-child {
    margin-left: 15px;
  }

  svg {
    width: 100%;
    height: 100%;
  }
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 300px;
  margin-top: 10px;
`;

const TimeDisplay = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #CED4DA;
  min-width: 40px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const CurrentTrackTime = styled.div`
  text-align: left;
`

const TotalTrackTime = styled.div`
  text-align: right;
`

const ProgressBar = styled.div`
  flex: auto;
  height: 6px;
  width: 100%;
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
  gap: 10px;
`;

const VolumeSlider = styled.div`
  flex: auto;
  height: 6px;
  width: 200px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
`;

const VolumeFill = styled.div<{ $volume: number }>`
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  width: ${props => props.$volume}%;
  transition: width 0.3s ease;
`;

const VolumeValue = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  min-width: 40px;
  text-align: right;
`;

const MuteButton = styled.button<{ $isMuted: boolean }>`
  background: none;
  border: none;
  width: 30px;
  height: 24px;
  color: ${props => props.$isMuted ? '#ff6b6b' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  
  &:active {
    transform: scale(0.95);
  }

  svg {
    max-width: 18px;
    max-height: 18px;
  }
`;

const ActionButtonsSection = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:active {
    transform: translateY(0);
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
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isSpeakerGroupOpen, setIsSpeakerGroupOpen] = useState(false);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false);

  const isPlaying = entity?.state === 'playing';
  const isPaused = entity?.state === 'paused';
  const isShuffled = entity?.attributes?.shuffle || false;
  const repeatMode = entity?.attributes?.repeat || 'off';
  const isMuted = entity?.attributes?.is_volume_muted || false;

  // Media attributes
  const mediaTitle = entity?.attributes?.media_title || 'Unknown Track';
  const mediaArtist = entity?.attributes?.media_artist || 'Unknown Artist';
  const mediaAlbumName = entity?.attributes?.media_album_name || '';
  const mediaImageUrl = getFullImageUrl(entity?.attributes?.entity_picture);
  const volumeLevel = entity?.attributes?.volume_level || 0;
  const mediaDuration = entity?.attributes?.media_duration || 0;
  const mediaPosition = entity?.attributes?.media_position || 0;
  const mediaPositionUpdatedAt = entity?.attributes?.media_position_updated_at;
  const groupMembers = entity?.attributes?.group_members || [];

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

  // Update volume when entity state changes
  React.useEffect(() => {
    if (isUpdatingVolume) return;
    
    if (entity?.attributes?.volume_level !== undefined) {
      const newVolume = Math.round(entity.attributes.volume_level * 100);
      setVolume(newVolume);
    }
  }, [entity, isUpdatingVolume]);

  const handleVolumeClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickProgress = clickX / rect.width;
    const newVolume = Math.round(clickProgress * 100);

    setVolume(newVolume);
    setIsUpdatingVolume(true);
    
    try {
      await hassApiFetch('/api/services/media_player/volume_set', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: entityId,
          volume_level: newVolume / 100,
        }),
      });
      
      setTimeout(() => {
        setIsUpdatingVolume(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to set volume:', error);
      setIsUpdatingVolume(false);
    }
  };

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

  const handleGrouping = () => {
    setIsSpeakerGroupOpen(true);
  };

  const handlePlaylists = () => {
    setIsPlaylistsOpen(true);
  };

  const handleCloseSpeakerGroup = () => {
    setIsSpeakerGroupOpen(false);
  };

  const handleClosePlaylists = () => {
    setIsPlaylistsOpen(false);
  };

  // Calculate progress percentage using currentPosition state
  const progress = mediaDuration > 0 ? (currentPosition / mediaDuration) * 100 : 0;

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
        </TrackInfo>
      </AlbumArtSection>

      <ProgressSection>
        <ProgressBar onClick={handleProgressClick}>
          <ProgressFill $progress={progress} />
        </ProgressBar>
        <TimeDisplay>
          <CurrentTrackTime>{formatTime(currentPosition)}</CurrentTrackTime>
          <TotalTrackTime>{formatTime(mediaDuration)}</TotalTrackTime>
        </TimeDisplay>
      </ProgressSection>

      <ControlsSection>
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

        <VolumeSection>
        <MuteButton $isMuted={isMuted} onClick={() => {
            const newMuteState = !isMuted;
            setIsUpdatingVolume(true);
            hassApiFetch('/api/services/media_player/volume_mute', {
              method: 'POST',
              body: JSON.stringify({
                entity_id: entityId,
                is_volume_muted: newMuteState,
              }),
            }).then(() => {
              setIsUpdatingVolume(false);
            }).catch(error => {
              console.error('Failed to mute volume:', error);
              setIsUpdatingVolume(false);
            });
          }}>
            {isMuted ? <MuteIcon /> : <SoundIcon />}
          </MuteButton>

          <VolumeSlider onClick={handleVolumeClick}>
            <VolumeFill $volume={volume} />
          </VolumeSlider>

          <VolumeValue>{volume}%</VolumeValue>
        </VolumeSection>

        <ActionButtonsSection>
          <ActionButton onClick={handleGrouping}>
            🏠 Group Speakers
          </ActionButton>
          <ActionButton onClick={handlePlaylists}>
            🎵 Playlists
          </ActionButton>
        </ActionButtonsSection>
      </ControlsSection>

      {/* Sliding Modals */}
      <SlidingModal 
        isOpen={isSpeakerGroupOpen} 
        onClose={handleCloseSpeakerGroup}
        height="90vh"
      >
        <SpeakerGroupPanel 
          primaryEntityId={entityId}
          onClose={handleCloseSpeakerGroup}
        />
      </SlidingModal>

      <SlidingModal 
        isOpen={isPlaylistsOpen} 
        onClose={handleClosePlaylists}
        height="70vh"
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Playlists</h2>
          <p>Playlist functionality coming soon...</p>
        </div>
      </SlidingModal>
    </ModalContent>
  );
} 