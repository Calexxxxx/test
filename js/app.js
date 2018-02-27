$(function() {
  var ctx = new AudioContext();
  var audio = document.getElementById('myAudio');
  var audioSrc = ctx.createMediaElementSource(audio);
  var analyser = ctx.createAnalyser();

  audioSrc.connect(analyser);
  audioSrc.connect(ctx.destination);
  // frequencyBinCount tells you how many values you'll receive from the analyser
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  var cube, cubeMaterial, cubeGeometry;
  var scene, camera, renderer;
  var controls, guiControls, datGUI;
  var axis, grid, color, fov;
  var spotLight;
  var stats;
  var SCREEN_WIDTH, SCREEN_HEIGHT;

  function init() {
    /*creates empty scene object and renderer*/
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    /*add controls*/
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    grid = new THREE.GridHelper(50, 5);
    color = new THREE.Color('rgb(255,0,0)');
    // grid.setColors(color, 0x000000);

    var x = 0;
    var y = 0;
    var z = 0;

    for (var i = 0; i < 1000; i++) {
      cubeGeometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
      cubeMaterial = new THREE.MeshPhongMaterial({
        color: frequencyData[i] * 0xff3300
      });
      cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.name = frequencyData.length;
      cube.position.x = x;

      x += 10;

      if (x == 100) {
        z += 10;
        x = 0;
      } else if (z == 100) {
        x = 0;
        y += 10;
        z = 0;
      }
      cube.position.y = y;
      cube.position.z = z;
      scene.add(cube);
    }

    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 50;
    camera.lookAt(scene.position);

    /*datGUI controls object*/
    guiControls = new function() {
      this.rotationX = 0.2;
      this.rotationY = 0.2;
      this.rotationZ = 0.2;

      this.lightX = 127;
      this.lightY = 152;
      this.lightZ = 127;
      this.intensity = 3.8;
      this.distance = 1000;
      this.angle = 2;
      this.exponent = 2;
      this.shadowCameraNear = 1;
      this.shadowCameraFar = 434;
      this.shadowCameraFov = 46;
      this.shadowCameraVisible = false;
      this.shadowMapWidth = 2056;
      this.shadowMapHeight = 2056;
      this.shadowBias = 0.0;
      this.shadowDarkness = 0.5;
      this.target = cube;
    }();
    /*adds spot light with starting parameters*/
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.position.set(20, 35, 40);
    spotLight.intensity = guiControls.intensity;
    spotLight.distance = guiControls.distance;
    spotLight.angle = guiControls.angle;
    spotLight.exponent = guiControls.exponent;
    spotLight.shadowCameraNear = guiControls.shadowCameraNear;
    spotLight.shadowCameraFar = guiControls.shadowCameraFar;
    spotLight.shadowCameraFov = guiControls.shadowCameraFov;
    spotLight.shadowCameraVisible = guiControls.shadowCameraVisible;
    spotLight.shadowBias = guiControls.shadowBias;
    spotLight.shadowDarkness = guiControls.shadowDarkness;
    scene.add(spotLight);

    $('#webGL-container').append(renderer.domElement);
    /*stats*/
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    $('#webGL-container').append(stats.domElement);
    console.log(scene);
    (fov = camera.fov), (zoom = 1.0), (inc = -0.01);
  }

  function render() {
    scene.traverse(function(e) {
      if (e instanceof THREE.Mesh) {
        e.rotation.x += frequencyData[50] / 1024;
        e.rotation.y = frequencyData[e.id] / 50;
        e.rotation.z += guiControls.rotationZ;
        var color = new THREE.Color(1, 1, 0);
        e.material.color.setRGB(frequencyData[e.id] / 220, 0, 0);
      }
    });
    guiControls.intensity = frequencyData[2];
    spotLight.position.x = guiControls.lightX;
    spotLight.position.y = guiControls.lightY;
    spotLight.position.z = guiControls.lightZ;
    analyser.getByteFrequencyData(frequencyData);
    camera.fov = fov * zoom;
    camera.updateProjectionMatrix();
    zoom += inc;
    if (
      zoom <= 0.1 * (frequencyData[20] / 100) ||
      zoom >= 1 * (frequencyData[20] / 50)
    ) {
      inc = -inc;
    }
    camera.rotation.y = 90 * Math.PI / 180;
    camera.rotation.z = frequencyData[20] * Math.PI / 180;
    camera.rotation.x = frequencyData[100] * Math.PI / 180;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();

    stats.update();
    renderer.render(scene, camera);
  }

  $(window).resize(function() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  });
  init();
  animate();
  audio.play();
});
