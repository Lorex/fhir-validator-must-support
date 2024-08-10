const { fpl } = require('fhir-package-loader');
const { exit } = require('process');
const jsonpath = require('jsonpath');
const config = require('./config.json');

const loadIg = async (err) => {
  const package = `${config.package}#${config.version}`;

  console.log(`- Loading package: ${package}`);
  const loader = await fpl([package], {
    cachePath: config.cachePath,
    log: console.log,
  });;

  if(loader.errors.length > 0) {
    console.log('Errors:');
    console.log(loader.errors);
    exit(1);
  }

  console.log(`- Loaded package: ${package}`);
}

const checkResource = async (resource) => {
  console.log(`- Checking resource: ${resource.resourceType}`);
  console.log(`- This resource uses the following profiles:`);
  console.log(resource.meta.profile);
  
  // find profile by url
  const profileFileNames = [];
  for(const profileUrl of resource.meta.profile) {
    const profileFileName = await findProfileFilename(profileUrl);
    profileFileNames.push(profileFileName);
  }
  console.log(`- Profiles found in package:`);
  console.log(profileFileNames);

  // iterate profiles
  for (const profileFileName of profileFileNames) {
    console.log(`- Checking profile: ${profileFileName}`);
    // load profile
    const profileResource = require(`./ig_cache/${config.package}#${config.version}/package/${profileFileName}`);

    // get all mustSupport elements
    const mustSupports = profileResource.snapshot.element.filter(e => e.mustSupport);
    let mustSupportPaths = mustSupports.map(e => e.path);
    // trim duplicate paths
    mustSupportPaths = [...new Set(mustSupportPaths)];
    // remove ResourceType of the path
    mustSupportPaths = mustSupportPaths.map(path => path.replace(`${resource.resourceType}.`, ''));

    // check if resource contains all mustSupport elements
    let missingMustSupportPaths = [];
    for(const path of mustSupportPaths) {
      // check if any layer of the path is an array by checking profileResource.snapshot.element[*].max > 1 or max = "*", attach that layer with [x]
      
      const jsonPath = parsePath(path, profileResource, resource.resourceType);

      // check if path contains [x]
      if(jsonPath.includes('[x]')) {
        // get supported types
        const supportedTypes = profileResource.snapshot.element.filter(e => e.path === `${resource.resourceType}.${path}`).map(e => e.type.map(t => t.code)).flat().map(t => t.charAt(0).toUpperCase() + t.slice(1));

        // check if resource matches any of the supported types
        let valid = false;
        for(const type of supportedTypes) {
          if(jsonpath.query(resource, `$..${jsonPath.replace('[x]', type)}`).length > 0) {
            valid = true;
            break;
          }
        }
        if(!valid) {
          missingMustSupportPaths.push(path);
          continue;
        }
        continue;
      }

      // check if path exists in resource
      if(jsonpath.query(resource, `$..${jsonPath}`).length === 0) {
        missingMustSupportPaths.push(path);
        continue;
      }
    }

    return {
      valid: missingMustSupportPaths.length === 0,
      missingMustSupportPaths
    };
  }
}

const findProfileFilename = async (profileUrl) => {
  // load profile list from ig_cache
  const profileList = require(`./ig_cache/${config.package}#${config.version}/package/.index.json`);
  const profile = profileList.files.find(p => p.url === profileUrl);
  if(!profile) {
    console.log(`! Profile not found: ${profileUrl}`);
    exit(1);
  }
  return profile.filename;
}

const parsePath = (path, structureDefinition, resourceType) => {
  // console.log(`!!! Parsing path: ${path}`);
  // check if any layer of the path is an array by checking profileResource.snapshot.element[*].max > 1 or max = "*", attach that layer with [x]
  // console.log(`- Parsing path: ${path}`);
  const pathLayers = path.split('.');
  // console.log(`- Layers: ${pathLayers}`);
  let currentPath = '';
  let layerCount = 0;

  // console.log(pathLayers);
  // check each layer of the path and see if it is an array
  
  for(const pathLayer of pathLayers) {
    currentPath += `${(layerCount == 0)?'':'.'}${pathLayer}`;
    // console.log(`- Checking layer: ${currentPath}`);
    const max = structureDefinition.snapshot.element.find(e => e.path === `${resourceType}.${currentPath}`).max;
    if(max === '*' || max > 1) {
      // console.log(`- Array detected: ${currentPath}`);
      pathLayers[layerCount] = `${pathLayer}[*]`;
    }
    layerCount++;
  }
  const newPath = pathLayers.join('.');
  return newPath;
}

const main = async (err) => {
  // get commang line arguments and convert to array
  const args = process.argv.slice(2);
  let filename = '';
  if(args.length > 0) {
    if(args[0] === '-e' || args[0] === '--example') {
      if(args.length < 2) {
        console.log('\x1b[41m ! Missing example name. Available examples: valid, invalid\x1b[0m');
        console.log('Usage: \x1b[33m node index.js [-e|--example] <valid|invalid> \x1b[0m');
        exit(1);
      }
      if(args[1] !== 'valid' && args[1] !== 'invalid') {
        console.log('\x1b[41m ! Invalid example name. Available examples: valid, invalid \x1b[0m');
        console.log('Usage: \x1b[33m node index.js [-e|--example] <valid|invalid> \x1b[0m');
        exit(1);
      }
      console.log(`\x1b[33mYou are using example json data. The -f argument will be ignored. \x1b[0m`);
      filename = `./example/${args[1]}.json`;
    }
    else if(args[0] === '-f' || args[0] === '--file') {
      if(args.length < 2) {
        console.log('\x1b[42m ! Missing filename. \x1b[0m');
        console.log('Usage: \x1b[33m node index.js [-f|--file] <filename> \x1b[0m');
        exit(1);
      }
      if(!args[1].endsWith('.json')) {
        console.log('\x1b[42m ! Invalid file format, only JSON files are supported. \x1b[0m');
        console.log('Usage: \x1b[33m node index.js [-f|--file] <filename> \x1b[0m');
        exit(1);
      }
      filename = args[1];
    }
    else {
      console.log('Usage:\x1b[33m node index.js [-f|--file] <filename> | [-e|--example] <valid|invalid> \x1b[0m');
      exit(1);
    }
  } else {
    console.log('Usage:\x1b[33m node index.js [-f|--file] <filename> | [-e|--example] <valid|invalid>\x1b[0m');
    exit(1);
  } 
  
  // load package
  await loadIg();
  
  // load resource
  const resource = require(filename);
  const check = await checkResource(resource);
  console.log(`====================================\n`);
  if(check.valid) {
    console.log(`\x1b[42m Resource check: Passed !!! \x1b[0m`);
  } else {
    console.log(`\x1b[41m Resource check: Failed !!! \x1b[0m`);
    console.log(`\n\x1b[33m Missing MustSupport elements: \x1b[0m`);
    check.missingMustSupportPaths.forEach(path => {
      console.log(`- ${path}`);
    });
  }
  console.log(`\n\x1b[0m====================================`);
}

main().catch(console.error);
