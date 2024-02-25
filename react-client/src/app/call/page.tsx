"use client"
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { NextPage } from 'next';

const SIGNALING_SERVER_URL = 'http://localhost:5004';
const TURN_SERVER_URL = 'localhost:3478';
const TURN_SERVER_USERNAME = 'username';
const TURN_SERVER_CREDENTIAL = 'credential';


interface SearchParams {
  username: string;
  room: string;
}


const PC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: 'turn:' + TURN_SERVER_URL + '?transport=tcp',
      username: TURN_SERVER_USERNAME,
      credential: TURN_SERVER_CREDENTIAL
    },
    {
      urls: 'turn:' + TURN_SERVER_URL + '?transport=udp',
      username: TURN_SERVER_USERNAME,
      credential: TURN_SERVER_CREDENTIAL
    }
  ]
};

const App: NextPage<{ searchParams: SearchParams }> = ({ searchParams }) => {
  const { username, room } = searchParams;

  const remoteStreamRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<HTMLVideoElement | null>(null);
  const localStreamData = useRef<MediaStream | null>(null);
  const socket = useRef<Socket | null>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {    
    getLocalStream()
  }, []);

  const sendData = (data: any) => {
    if(socket.current){
      socket.current.emit('data', {
        username: username,
        room: parseInt(room),
        data: data,
      });
    }
  };

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      if (!socket.current) {
        socket.current = io(SIGNALING_SERVER_URL, { autoConnect: false });


        socket.current.on('data', (data: any) => {
          console.log('Data received: ', data);
          handleSignalingData(data);
        });
    
        socket.current.on('ready', () => {
          console.log('Ready');
          createPeerConnection();
          sendOffer();
        });

        console.log('Stream found');
        console.log(stream)
        stream.getAudioTracks()[0].enabled = false;
        if (!localStreamData.current) {
          localStreamData.current = stream;
          if(localStreamRef.current) {
            localStreamRef.current.srcObject = stream;
          }
        }

        socket.current.connect();
        socket.current.emit("join", { username: username, room: parseInt(room) });

      }
      
    } catch (error) {
      console.error('Stream not found: ', error);
    }
  };

  const createPeerConnection = (): void => {
    try {
      const pc: RTCPeerConnection = new RTCPeerConnection(PC_CONFIG);
      pcRef.current = pc;
      pc.onicecandidate = onIceCandidate;
      pc.ontrack = onTrack;
  
      // Check if localStreamData.current is not null before accessing its properties
      if (localStreamData.current !== null) {
        localStreamData.current.getAudioTracks().forEach(t => {
          if (localStreamData.current !== null) {
            pc.addTrack(t, localStreamData.current);
          }
        });
      } else {
        console.error('Local stream or its srcObject is null');
      }
  
      console.log('PeerConnection created');
    } catch (error) {
      console.error('PeerConnection failed: ', error);
    }
  };  

  const sendOffer = () => {
    console.log('Send offer');
    pcRef.current?.createOffer().then(
      setAndSendLocalDescription,
      (error) => {
        console.error('Send offer failed: ', error);
      }
    );
  };

  const sendAnswer = () => {
    console.log('Send answer');
    pcRef.current?.createAnswer().then(
      setAndSendLocalDescription,
      (error) => {
        console.error('Send answer failed: ', error);
      }
    );
  };

  const setAndSendLocalDescription = (sessionDescription: RTCSessionDescriptionInit) => {
    pcRef.current?.setLocalDescription(sessionDescription);
    console.log('Local description set');
    sendData(sessionDescription);
  };

  const onIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      console.log('ICE candidate');
      sendData({
        type: 'candidate',
        candidate: event.candidate
      });
    }
  };

  const onTrack = (event: RTCTrackEvent) => {
    console.log('Add track');
    if (remoteStreamRef.current) {
      remoteStreamRef.current.srcObject = event.streams[0];
    }
  };

  const handleSignalingData = (data: any) => {
    switch (data.type) {
      case 'offer':
        createPeerConnection();
        pcRef.current?.setRemoteDescription(new RTCSessionDescription(data));
        sendAnswer();
        break;
      case 'answer':
        pcRef.current?.setRemoteDescription(new RTCSessionDescription(data));
        break;
      case 'candidate':
        pcRef.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
        break;
      default:
        break;
    }
  };

  const toggleMic = () => {
    if(!localStreamData.current) return;

    localStreamData.current.getAudioTracks().map(track => {
      track.enabled = !track.enabled;
      const micClass = track.enabled ? 'bg-green-200' : 'bg-red-200';
      const toggleMicButton = document.getElementById('toggleMic');
      if (toggleMicButton) toggleMicButton.className = micClass;
    })
  };

  return (
    <div>
      <video id="remoteStream" ref={remoteStreamRef} autoPlay playsInline />
      <video id="localStream" ref={localStreamRef} muted />
      <button id="toggleMic" onClick={toggleMic} className="bg-red-200">Toggle Mic</button>
    </div>
  );
};

export default App;
