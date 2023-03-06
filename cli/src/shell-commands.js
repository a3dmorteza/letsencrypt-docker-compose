import { promisify } from 'util';
import { exec } from 'child_process';

const execute = promisify(exec);

const runCommand = async (command, logOutput = true) => {
  try {
    console.log('Executing command:', command);
    const { stdout, stderr } = await execute(command);
    console.error(stderr);
    if (logOutput) {
      console.log(stdout);
    }
    return { stdout, stderr };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export const isNginxServiceRunning = async () => {
  const { stdout } = await runCommand('docker compose ps --format json', false);
  const containers = JSON.parse(stdout);
  return !!containers.find(
    (container) =>
      container.Service === 'nginx' && container.State === 'running'
  );
};

export const stopNginx = async () => {
  await runCommand('docker compose stop nginx');
};

export const restartNginx = async () => {
  await runCommand('docker compose up -d --force-recreate --wait nginx');
};

export const createAndStartCertbot = async () => {
  await runCommand('docker compose up -d --no-deps certbot');
};

export const reloadNginxConfig = async () => {
  await runCommand('docker compose exec --no-TTY nginx nginx -s reload');
};

export const deleteCertbotCertificate = async (domainName) => {
  await runCommand(
    `docker compose run --rm --no-deps --no-TTY --entrypoint certbot certbot -n delete --cert-name ${domainName}`
  );
};

export const forceRenewCertbotCertificate = async () => {
  await runCommand(
    'docker compose run --rm --no-deps --no-TTY --entrypoint certbot certbot renew --no-random-sleep-on-renew --force-renew'
  );
};
