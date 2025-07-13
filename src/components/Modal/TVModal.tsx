import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import VerticalSlider from '../VerticalSlider/VerticalSlider';
import ModalHeader from './shared/ModalHeader';

// Import brand logo PNGs
import netflixLogo from '../../assets/tv_quick_links/netflix.jpg';
import disneyLogo from '../../assets/tv_quick_links/disneyplus.jpg';
import huluLogo from '../../assets/tv_quick_links/hulu.jpg';
import primeLogo from '../../assets/tv_quick_links/prime_video.jpg';
import youtubeLogo from '../../assets/tv_quick_links/youtube.jpg';
import youtubeKidsLogo from '../../assets/tv_quick_links/youtube_kids.jpg';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 30px;
`;

const VolumeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const VolumeLabel = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-align: center;
`;

const VolumeValue = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  text-align: center;
`;

const QuickLinksSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const QuickLinksLabel = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-align: center;
`;

const TVQuickLinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  width: 100%;
  justify-content: center;
  max-width: 330px; /* 3 buttons * 90px + 2 gaps * 15px = 300px + 30px = 330px */
  margin: 0 auto;
`;

const QuickLinkButton = styled.button`
  width: 90px;
  height: 100px;
  border: none;
  border-radius: 17px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

interface TVModalProps {
  entityId: string;
  name: string;
}

// Quick links for TV apps with background images
const quickLinks = [
  {
    id: 'netflix',
    label: 'Netflix',
    backgroundImage: netflixLogo
  },
  {
    id: 'disney',
    label: 'Disney+',
    backgroundImage: disneyLogo
  },
  {
    id: 'hulu',
    label: 'Hulu',
    backgroundImage: huluLogo
  },
  {
    id: 'prime',
    label: 'Prime Video',
    backgroundImage: primeLogo
  },
  {
    id: 'youtube',
    label: 'YouTube',
    backgroundImage: youtubeLogo
  },
  {
    id: 'youtube_kids',
    label: 'YouTube Kids',
    backgroundImage: youtubeKidsLogo
  }
];

export default function TVModal({ entityId, name }: TVModalProps) {
  const { closeModal } = useModal();
  const entity = useEntityState(entityId);
  const [volume, setVolume] = useState(50);
  const [isUpdatingVolume, setIsUpdatingVolume] = useState(false);

  // Update volume when entity state changes
  React.useEffect(() => {
    if (isUpdatingVolume) return;
    
    if (entity?.attributes?.volume_level !== undefined) {
      const newVolume = Math.round(entity.attributes.volume_level * 100);
      setVolume(newVolume);
    }
  }, [entity, isUpdatingVolume]);

  const handleVolumeChange = useCallback((value: number) => {
    // Don't update parent state during dragging
  }, []);

  const handleVolumeRelease = useCallback(async (value: number) => {
    setVolume(value);
    setIsUpdatingVolume(true);
    
    try {
      await hassApiFetch('/api/services/media_player/volume_set', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: entityId,
          volume_level: value / 100, // Convert percentage to 0-1 range
        }),
      });
      
      setTimeout(() => {
        setIsUpdatingVolume(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to set volume:', error);
      setIsUpdatingVolume(false);
    }
  }, [entityId]);

  const handleQuickLinkClick = async (appId: string) => {
    try {
      // This would need to be customized based on your TV's capabilities
      // For now, we'll just log the app selection
      console.log(`Launching ${appId} on ${name}`);
      
      // Example: You might need to send a specific service call for your TV
      // await hassApiFetch('/api/services/media_player/select_source', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     entity_id: entityId,
      //     source: appId,
      //   }),
      // });
      
    } catch (error) {
      console.error(`Failed to launch ${appId}:`, error);
    }
  };

  return (
    <>
      <ModalHeader title={name} onClose={closeModal} centered />
      <ModalContent>
        <VolumeSection>
          <VolumeLabel>Volume</VolumeLabel>
          <VerticalSlider
            value={volume}
            onChange={handleVolumeChange}
            onRelease={handleVolumeRelease}
            unit="%"
          />
          <VolumeValue>{volume}%</VolumeValue>
        </VolumeSection>
        
        <QuickLinksSection>
          <TVQuickLinksGrid>
            {quickLinks.map((link) => (
              <QuickLinkButton
                key={link.id}
                onClick={() => handleQuickLinkClick(link.id)}
                style={{ backgroundImage: `url(${link.backgroundImage})` }}
              />
            ))}
          </TVQuickLinksGrid>
        </QuickLinksSection>
      </ModalContent>
    </>
  );
} 