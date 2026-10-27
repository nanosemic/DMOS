// Shared dimensions of the 3D device (used by the scene and by the callouts that point at it).

export const DEVICE_SIZE = { W: 4.2, D: 2.2 } // width (x), depth (z)

// layer stack: [id, centre y, height] — bottom to top
export const LAYERS = [
  ['drain', -1.6, 0.12],
  ['substrate', -1.24, 0.56],
  ['drift', -0.16, 1.56],
  ['body', 0.74, 0.26],
  ['gate', 0.98, 0.18],
  ['source', 1.17, 0.2],
]
