import { network_log } from './network_log';
import * as Dockerode  from 'dockerode';

/**
 * Utility to pull provided docker image. Resolves only when pull is complete.
 *
 * @param docker
 * @param image
 * @param version
 */
export async function pull_image(docker: Dockerode, image: string, version: string): Promise<void> {
    network_log.info(`Docker::pull | pulling ${image}:${version}`);

    return new Promise((ok, ko) => {
        docker.pull(`${image}:${version}`, (err, res) => {

            if (err) {
                return ko(err);
            }

            docker.modem.followProgress(res, () => {
                network_log.success(`Docker::pull | pulled ${image}:${version}`);
                ok();
            });

        });

    })
}

