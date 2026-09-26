const fs = require("fs");
const edit = (p, pairs) => {
  let s = fs.readFileSync(p, "utf8");
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(p + " — no match:\n" + a.slice(0, 200));
    if (s.split(a).length > 2) throw new Error(p + " — anchor not unique:\n" + a.slice(0, 120));
    s = s.replace(a, b);
  }
  fs.writeFileSync(p, s);
};

// ---- 1. the foyer scene: tidy the indentation and aim its two hotspots at
//         the opening into the living room (they were left on blank walls).
edit("src/lib/tourData.js", [[
`    {
        "id": "17-foyer",
        "name": "Foyer",
        "levels": [
          {
            "tileSize": 256,
            "size": 256,
            "fallbackOnly": true
          },
          {
            "tileSize": 512,
            "size": 512
          },
          {
            "tileSize": 512,
            "size": 1024
          },
          {
            "tileSize": 512,
            "size": 2048
          }
        ],
        "faceSize": 2000,
        "initialViewParameters": {
          "pitch": 0,
          "yaw": 0,
          "fov": 1.5707963267948966
        },
        "linkHotspots": [
         
        {
          "yaw": -1.2978682741889038,
          "pitch": 0.19121958523605542,
          "rotation": 0,
          "target": "0-living-cam_2"
        },
        {
          "yaw": 1.3890438478174936,
          "pitch": 0.23258243370101006,
          "rotation": 0,
          "target": "15-living-balcony"
        }
        ],
        "infoHotspots": []
      },`,
`    {
      "id": "17-foyer",
      "name": "Foyer",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 2000,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.5235987755982988,
          "pitch": 0.28,
          "rotation": 0,
          "target": "0-living-cam_2"
        },
        {
          "yaw": 0.3141592653589793,
          "pitch": 0.08,
          "rotation": 0,
          "target": "15-living-balcony"
        }
      ],
      "infoHotspots": []
    },`,
]]);

// ---- 2. the way back: living room and balcony each get a hotspot to the foyer
edit("src/lib/tourData.js", [[
`        {
          "yaw": -1.363457263179761,
          "pitch": 0.3170025924486435,
          "rotation": 0,
          "target": "11-guest-washroom_2"
        }
      ],`,
`        {
          "yaw": -1.363457263179761,
          "pitch": 0.3170025924486435,
          "rotation": 0,
          "target": "11-guest-washroom_2"
        },
        {
          "yaw": -2.5866190845660672,
          "pitch": 0.3,
          "rotation": 0,
          "target": "17-foyer"
        }
      ],`,
], [
`        {
          "yaw": 2.839608817739414,
          "pitch": 0.13282491483369618,
          "rotation": 0,
          "target": "14-kitchen"
        }
      ],`,
`        {
          "yaw": 2.839608817739414,
          "pitch": 0.13282491483369618,
          "rotation": 0,
          "target": "14-kitchen"
        },
        {
          "yaw": -2.9372099184048766,
          "pitch": 0.14,
          "rotation": 0,
          "target": "17-foyer"
        }
      ],`,
]]);

// ---- 3. the 4.5 BHK now opens at the front door
edit("src/lib/tours.js", [[
`    firstScene: "0-living-cam_2",`,
`    // The entrance foyer, looking down into the living room.
    firstScene: "17-foyer",`,
]]);

// ---- 4. and the foyer joins the floor plan
edit("src/lib/minimapData.js", [[
`    { id: "16-guest_room", x: 69.08, y: 57.35, north: 108 },`,
`    { id: "16-guest_room", x: 69.08, y: 57.35, north: 108 },
    { id: "17-foyer", x: 59.69, y: 28.06, north: 168 },`,
]]);
console.log("ok");
