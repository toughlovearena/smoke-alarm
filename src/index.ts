import { Updater } from '@toughlovearena/updater';
import fs from 'fs';
import { SmokeAlarm, SmokeAlarmConfig } from "smoke-alarm";
import { SmokeAlarmVerify } from 'smoke-alarm/lib/types';

const oneMinute = 1000 * 60;
const oneHour = oneMinute * 60;

const auth: { awsKey: string, awsSecret: string } = JSON.parse(fs.readFileSync('auth.json').toString());
const verifyJson: SmokeAlarmVerify = resp => ({
  ok: !!resp.json,
});
const sumPresence: SmokeAlarmVerify = resp => {
  const counts = resp.json ? Object.values(resp.json as Record<string, number>) : [0];
  const sum = counts.reduce((a, b) => a + b, 0);
  return {
    ...verifyJson(resp),
    message: `${sum} players online`,
  };
};

const config: SmokeAlarmConfig = {
  intervalMS: oneMinute * 5,
  positiveIntervalMS: oneMinute * 60,

  recipients: [
    'toughlovearena@gmail.com',
  ],
  auth: {
    awsSes: {
      from: 'toughlovearena.login@gmail.com',
      key: auth.awsKey,
      secret: auth.awsSecret,
    },
  },

  services: [{
    label: 'toughlovearena.com',
    endpoints: [{
      url: 'https://toughlovearena.com/version.json',
      verify: resp => ({
        ok: !!resp.json,
        message: resp.json?.v,
      }),
    }],
  }, {
    label: 'cache.tla',
    endpoints: [{
      url: 'https://cache.toughlovearena.com/health',
      verify: verifyJson,
    }],
  }, {
    label: 'handshake.tla',
    endpoints: [{
      url: 'https://handshake.toughlovearena.com/health',
      verify: verifyJson,
    }],
  }, {
    label: 'leaderboard.tla',
    endpoints: [{
      url: 'https://leaderboard.toughlovearena.com/health',
      verify: verifyJson,
    }],
  }, {
    label: 'matchmaker.tla',
    endpoints: [{
      url: 'https://matchmaker.toughlovearena.com',
      verify: verifyJson,
    }],
  }, {
    label: 'presence.tla',
    endpoints: [{
      url: 'https://presence.toughlovearena.com/health',
      verify: verifyJson,
    }, {
      url: 'https://presence.toughlovearena.com',
      verify: sumPresence,
    }],
  }, {
    label: 'lobbya.tla',
    endpoints: [{
      url: 'https://lobbya.toughlovearena.com/health',
      verify: verifyJson,
    }],
  }, {
    label: 'lobbyb.tla',
    endpoints: [{
      url: 'https://lobbyb.toughlovearena.com/health',
      verify: verifyJson,
    }],
  }, {
    label: 'stun.tla',
    endpoints: [{
      url: 'https://stun.toughlovearena.com/health',
    }],
  }, {
    label: 'ice.tla',
    endpoints: [{
      url: 'https://ice.toughlovearena.com',
    }],
  }, {
    label: 'serverless accounts API	',
    endpoints: [{
      url: 'https://us-central1-fighter-api.cloudfunctions.net/webApi/api/v1/',
      verify: verifyJson,
    }],
  }],
};

(async () => {
  new Updater().cron();
  new SmokeAlarm(config).start();
})();
