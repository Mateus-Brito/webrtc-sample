"use client"
import Link from 'next/link';
import React, { useState } from 'react';

function HomeScreen() {
  const [room, setRoom] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="max-w-md mx-auto" method="post" action="">
        <label htmlFor="username" className="block text-gray-700">Username</label>

        <input
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={username}
          title="username"
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
        />

        <label htmlFor="room" className="block mt-4 text-gray-700">Room</label>

        <input
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={room}
          title="room"
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => setRoom(e.target.value)}
        />
        <Link href={`/call/?username=${username}&room=${room}`}>
          <button type="submit" className="mt-4 w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600">
            Join Room
          </button>
        </Link>
      </form>
    </div>
  );
}

export default HomeScreen;
