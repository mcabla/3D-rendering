# Natural scene generation

Mateo Van Damme, Casper Haems

### Links

Link online website: [https://mcabla.github.io/3D-rendering/index.html](https://mcabla.github.io/3D-rendering/index.html)

### Demo overview

With the navigation bar you can choose between different demo's.

Short overview: 

- Natural: This world combines the natural phenomenon from all the demo's and integrates them into one world that mimics a natural environment.  
- Boids: This example implements boid behaviour using 6 simple rules. 
- Fireflies 2: Mimicking firefly behaviour using a particle system. 
- Perlin LOD: This demo features a single chunk with automatically generated terrain. Zooming in and out with the mouse wheel automatically adjusts the level of detail automatically. The terrain generation is based on adding different levels of Perlin noise together. 
- Tree 2D: ?
- Tree: (check this) This demo contains different tree species generated using L-systems. 
- Clouds: Simulated clouds using a particle system. 

### Disabled demo's

These demo's are disabled in the navbar but can be manually re-enabled by editing the HTML.

   - Infinite terrain 
- Terrain -> Remove or hide? 
- Fractals -> Remove or hide? 
- Trees
- Water 
- Fireflies
- Cube 

# Demo explanations

## Boids demo - Mateo

This demo shows boid behavior. Boids are implemented using a BoidManager and a Boid class. Each tick the boidManager updates all his boids. Updating a boid means applying a set of rules. Each rule exerts a force on the boid that changes it's velocity. After applying all the forces the new velocity is normalized so the boids go the same speed. 

**Boid rules.** 

1. All boids go the same speed at all times
2. Avoid walls and floors.  There are currently two modes: 
   - Floormode off: In the first mode the boids are contained in a cube. When they leave the cube they are pushed back in. 
   - Floormode on: This mode is equivalent to freeroam. This is visible in the "Natural" demo. The boids are pushed away from the floor and there is a weak atraction to the world center. 

3) Gravity. Boids are constantly pulled towards the ground with a force. Parameter: ``gravity``
4) Attraction to the center of the swarm. At each point in time the boids are attracted to the centroid of all positions. Parameter: `attractForce`
5) Collision avoidance: If boids are within a range of `minDistance` they are considered neighbours. Neighbours repel each other more the closer they get. Parameter: `avoidForce`
6) Conform direction: Neighbours also try to match each others direction/heading. The effect get's greater the closer they get to each other. 

Earlier version: 

In an earlier version of the boid algorithm there was a leader boid. All other boids were attracted to this boid instead of the centroid of the positions. The leader boid also had no collision avoidance with the other boids because it would get pushed into a corner otherwise. Rule 6 was also not present. This early simpler implementation worked but the swarm was too rigid and just bounced around the cube. 

I tried turning off the leader boid in this stage but this lead to the boids all swarming in a stationary ball where  they never traveld in one direction as a group. After introducing rule 6 this became possible. After doing this the hacky concept of a "leader drone" was no longer necessary. 

**Credit**

I (Mateo) wrote all the code myself. I was inspired by this implementation: https://github.com/juanuys/boids

## Perlin LOD - Mateo

**Credit**

I mateo wrote all the code myself. I did take inspiration from Casper's implementation of the terrain world. 
I also based it of this blog: https://blog.mastermaps.com/2013/10/terrain-building-with-threejs.html