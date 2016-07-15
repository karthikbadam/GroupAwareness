module.exports = Cluster

/**
 * All supported linkage functions.
 * You can add your own globally or use them for whatever you want.
 */

Cluster.linkages = {
    'single': singleLink,
    'complete': completeLink,
    'average': averageLink,
}

function Cluster(options) {
    if (!(this instanceof Cluster)) return new Cluster(options)

    if (!Array.isArray(options.input)) throw new TypeError('input must be an array')
    if (!options.input.length) throw new Error('input must not be empty')
    if (typeof options.distance !== 'function') throw new TypeError('invalid distance function')

    if (typeof options.linkage === 'string') options.linkage = Cluster.linkages[options.linkage]

    if (typeof options.linkage !== 'function') throw new TypeError('invalid linkage function')


    this.input = options.input
    this.distance = options.distance
    this.linkage = options.linkage
    this.centroid = options.centroid

    // array of distances between each input index
    this.distances = createDistanceArray(options.input, options.distance)
        // cache lookup for similarities between clusters
    this.links = Object.create(null)
    this.centroids = Object.create(null)

    // store the current clusters by indexes
    // this is private and gets rewritten on every level
    var clusters = this.clusters = []
    for (var i = 0, l = options.input.length; i < l; i++)
        clusters.push([i])

    // store each level
    var level = {
        linkage: null,
        clusters: clusters,
    }
    this.levels = [level]

    var minClusters = Math.max(options.minClusters || 1, 1)
    var maxLinkage = typeof options.maxLinkage === 'number' ? options.maxLinkage : Infinity

    while (this.clusters.length > minClusters && level.linkage < maxLinkage)
        level = this.reduce()

    console.log("finished reducing");
    return this.levels
}

/**
 * Merge the two most closely linked clusters.
 */

Cluster.prototype.reduce = function () {

    var clusters = this.clusters
    var min
    for (var i = 0; i < clusters.length; i++) {
        for (var j = 0; j < i; j++) {
            var linkage
            if (this.centroid) {
                
                linkage = this.centroidLinkageOf(clusters[i],
                                                 clusters[j])

            } else {

                linkage = this.linkageOf(clusters[i], clusters[j])

            }
            
            // set the linkage as the min
            if (!min || linkage < min.linkage) {
                min = {
                    linkage: linkage,
                    i: i,
                    j: j,
                }
            }
        }
    }

    clusters = this.clusters = clusters.slice()
    clusters[min.i] = clusters[min.i].concat(clusters[min.j])
    clusters.splice(min.j, 1)
    var level = {
        linkage: min.linkage,
        clusters: clusters,
        from: j,
        to: i,
    }
    this.levels.push(level)
    return level
}

/**
 * Calculate the linkage between two clusters.
 */

Cluster.prototype.linkageOf = function (clusterA, clusterB) {
    var hash = clusterA.length > clusterB.length ? ('' + clusterA + '-' + clusterB) : ('' + clusterB + '-' + clusterA)
    var links = this.links
    if (hash in links) return links[hash]

    // grab all the distances
    var distances = [];
    for (var k = 0; k < clusterA.length; k++) {
        for (var h = 0; h < clusterB.length; h++) {
            distances.push(this.distanceOf(clusterA[k], clusterB[h]))
        }
    }

    // cache and return the linkage
    return links[hash] = this.linkage(distances)
}

Cluster.prototype.centroidLinkageOf = function (clusterA, clusterB) {
    var hash = clusterA.length > clusterB.length ? ('' + clusterA + '-' + clusterB) : ('' + clusterB + '-' + clusterA)
    var links = this.links
    if (hash in links) return links[hash]
    
    var ahash = '' + clusterA
    var bhash = '' + clusterB
    
    var c1, c2
    
    if (ahash in this.centroids) {
        
        c1 = this.centroids[ahash];
        
    } else {
        
        c1 = this.centroid(clusterA, this.input);
        this.centroids[ahash] = c1;
    }
    
    
    if (bhash in this.centroids) {
    
        c2 = this.centroids[bhash];
        
    } else {
        
        c2 = this.centroid(clusterB, this.input);
        this.centroids[bhash] = c2;
    }

    return links[hash] = this.distance(c1, c2);
}

/**
 * Calculate the distance between two inputs.
 */

Cluster.prototype.distanceOf = function (i, j) {
    if (i > j) return this.distances[i][j]
    return this.distances[j][i]
}

/**
 * Create the upper triangle of the symmetric, distance matrix.
 * Only i > j is valid for matrix[i][j].
 */

function createDistanceArray(input, distance) {
    var length = input.length
    var matrix = new Array(length)

    console.log("started computing distance array");
    for (var i = 0; i < length; i++) {
        matrix[i] = new Array(i)
        for (var j = 0; j < i; j++)
            matrix[i][j] = distance(input[i], input[j])
    }
    console.log("finished computing distance array");

    return matrix
}

/*
 * Predefined linkage functions
 */

function singleLink(distances) {
    return Math.min.apply(null, distances)
}

function completeLink(distances) {
    return Math.max.apply(null, distances)
}

function averageLink(distances) {
    var sum = distances.reduce(function (a, b) {
        return a + b
    })
    return sum / distances.length
}