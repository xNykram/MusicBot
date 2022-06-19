
<img src="https://static.wikia.nocookie.net/polskapersopedia/images/3/32/Discord_logo_okr%C4%85g%C5%82e.png/revision/latest?cb=20200101201518&path-prefix=pl" width="150" height="150">


![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)




![maintenance](https://img.shields.io/badge/maintained-yes-green.svg)
![PyPI license](https://img.shields.io/pypi/l/ansicolortags.svg)
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://https://discord.com/)
![Generic badge](https://img.shields.io/badge/release-v0.01-blue.svg)


***

A discord music bot which plays songs from steraming platforms ex. YouTube. MusicBot was designed to bring more activity to your server, while keeping control over it all with a simple web interface and advanced, but elegant moderation features.

## Features

- Fast loading of songs

- Various useful commands

- Integration with database

- No external keys needed

- Playlist support

## Commands

- `!help` - Shows command list.

- `!join` - Makes bot join yours voice channel.

- `!leave` - Forces bot to leave voice channel.

- `!play` - Search and plays given song.

- `!stop` - Forces bot to stop playing music and leave.

- `!skip`- Skips given amount of songs.

- `!queue` - Shows tracks queue.

- `!shuffle` - Mixes up the current queue.

- `!search` - Search for a given title.

- `!changelog` - Display a list of the latest changes.

- `!remove`- Removes given position(s) from the queue.

- `!loop` - Loops current queue given amount of times.

- `!status`- Shows debug information (for developers).

- `!top` - Shows best three songs on the current server.

- `!top global` - Shows best three songs on all servers.

- `!favourites [add]/[remove]/[play]` - List of favourite songs. Allows you to add or remove a song from your favourites list. You can also add all songs from your favourites list to the queue.


## Setup


 - Install [Docker Engine](https://docs.docker.com/compose/install/). 
 

- Run `git clone https://github.com/WebSoftDevs/MusicBot.git`
- Create `.env` file in root directory:
```
# .env
MB_PREFIX='!' # Prefix used to invoke commands.
MB_TOKEN='' # API Discord Key
MB_DEBUG_TOKEN='' # API Discord Key used for debugging bot
PGHOST=sql1 # Container name
PGUSER=yoursUser
PGPASSWORD=yoursPassword
PGDATABASE=yoursDbName
```

- Match credentials in .env file with credentials in docker-compose-local.yml file.
- Run below commands:

    `docker build .`

    `docker-compose -f docker-compose-local.yml up`

