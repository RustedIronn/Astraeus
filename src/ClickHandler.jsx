const ClickHandler = () => {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!pointsRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // ensure raycast works after reload
    pointsRef.current.raycast = THREE.Points.prototype.raycast;
    pointsRef.current.geometry.computeBoundingSphere();

    function handleClick(event) {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // adaptive threshold so clicks don’t feel broken after reload
      raycaster.params.Points.threshold = 10;

      raycaster.setFromCamera(mouse, camera);
      const intersects = pointsRef.current
        ? raycaster.intersectObject(pointsRef.current)
        : [];

      if (intersects.length > 0) {
        const nearest = intersects.reduce((a, b) =>
          a.distance < b.distance ? a : b
        );
        const star = pointsRef.current.userData.stars?.[nearest.index];
        if (star) setSelectedStar(star);
      }
    }

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [stars, camera, gl]);

  return null;
};
