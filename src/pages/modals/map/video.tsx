import React from 'react';
import "./styles.css";
import { Modal } from 'react-bootstrap';
import { VideoModalProps } from './types';
import errorImg from "../../../assets/images/error.png";

const VideoModal: React.FC<VideoModalProps> = ({ show, handleClose, trailerKey }) => {
  return (
    <Modal className="custom-modal" show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Reproduzir Trailer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {trailerKey ? (
          <iframe
            width="100%"
            height="400px"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Trailer"
          />
        ) : (
            <div className='justifyCenter'>
                <p className='titleTrailer'>Trailer não encontrado.</p>
                <img className="imgSize" src={errorImg} alt="Logo" />
            </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default VideoModal;
