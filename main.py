import aiohttp
from aiohttp_index import IndexMiddleware
import asyncio
import click
import logbook
from pathlib import Path
import socket
import struct
import sys
from aiohttp import web



_METRIC_NAMES = {
    3: 'speeds',
    13: 'trim_flap_brakes',
    20: 'lat_long_alt',

}
_METRIC_FORMAT = "i8f"
_METRIC_LENGTH = struct.calcsize(_METRIC_FORMAT)

_logger = logbook.Logger(__name__)


class Console:

    def __init__(self):
        super().__init__()
        self.peer = None
        self.data = {
            'ias': 0,
            'lattitude': 0,
            'longitude': 0,
            'lat': 0,
            'lng': 0,
        }

    def set_lat_long_alt(self, lattitude, longitude, altitude, *_):
        self.data['longitude'] = self.data['lng'] = longitude
        self.data['lattitude'] = self.data['lat'] = lattitude
        self.data['altitude'] = self.data['alt'] = altitude

    def set_speeds(self, ias, *_):
        self.data['ias'] = ias

    def set_trim_flap_brakes(self, *args):
        _logger.debug('trim flap: {}', args)
        self.data['speedbrakes'] = args[-1] > 0.0001

class XPlaneDataProtocol(asyncio.DatagramProtocol):

    def __init__(self, console):
        super().__init__()
        self._console = console

    def datagram_received(self, data, addr):
        if self._console.peer is None:
            self._console.peer = addr
        if data.startswith(b"DATA"):
            data = data[5:]
            for i in range(len(data) // _METRIC_LENGTH):
                metric_index, *values = struct.unpack(_METRIC_FORMAT, data[i * _METRIC_LENGTH:(i + 1) * _METRIC_LENGTH])
                _logger.debug('Got metric index: {}', metric_index)
                name = _METRIC_NAMES.get(metric_index)
                if name is None:
                    continue
                getattr(self._console, f'set_{name}')(*values)

################################################################################



async def handle_status(request):
    return web.json_response(request.app['console'].data)

async def handle_command(request):
    console = request.app['console']
    if not console.peer:
        return web.json_response({'result': 'no peer'})
    params = await request.json()
    command = params['command']
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    _logger.debug("sending {} -> {}", b"CMND\0" + command.encode('utf-8') + b"\0", (console.peer[0], 49000))
    s.sendto(b"CMND\0" + command.encode('utf-8') + b"\0", (console.peer[0], 49000))
    return web.json_response({'result': 'ok'})


################################################################################

_PROJECT_ROOT = Path('.').absolute()

@click.command()
@click.option("-v", "--verbose", count=True)
@click.option("-q", "--quiet", count=True)
@click.option("--x-plane-listen-port", "x_plane_port", default=8888)
@click.option("--port", default=8000)
def main(verbose, quiet, x_plane_port, port):
    with logbook.NullHandler(), logbook.StreamHandler(sys.stderr, level=logbook.WARNING-verbose+quiet, bubble=False):
        loop = asyncio.get_event_loop()
        console = Console()

        webapp = web.Application(middlewares=[IndexMiddleware()])

        webapp['console'] = console
        webapp.router.add_get('/status', handle_status)
        webapp.router.add_post('/command', handle_command)
        webapp.router.add_static('/', _PROJECT_ROOT / 'webapp' / 'dist')

        loop.run_until_complete(loop.create_server(webapp.make_handler(), '0.0.0.0', port))
        loop.run_until_complete(loop.create_datagram_endpoint(lambda: XPlaneDataProtocol(console), local_addr=('0.0.0.0', x_plane_port)))
        loop.run_forever()
        loop.close()


if __name__ == "__main__":
    main() # pylint: disable=no-value-for-parameter
