const apiUrl = "https://archive.org/metadata";

async function getMetadata(identifier) {
  const metadataUrl = apiUrl + "/" + identifier;
  response = await fetch(metadataUrl);
  if (response !== undefined) {
    const data = await response.json();
    return {
      identifier,
      cdn1: "https://" + data.d1 + data.dir,
      cdn2: "https://" + data.d2 + data.dir,
      files: data.files,
    };
  } else {
    return undefined;
  }
}

function toIdentifier(s) {
  const url = /^https?:\/\/archive.org\/(.+)/;
  const identifier = /^[A-Za-z0-9_\-.]+$/;
  const match = s.match(url);
  if (match === null) {
    if (identifier.test(s)) {
      return s;
    } else {
      return undefined;
    }
  } else {
    return match[1].split("/")[1];
  }
}

function toPermalink(identifer, path) {
  return "https://archive.org/download/" + identifer + "/" + path;
}

function getFileLinks(metadata) {
  if (metadata === undefined) {
    return [];
  }
  const files = [];
  console.log(metadata);
  metadata.files.forEach((f) => {
    // TODO: also use the second cdn
    files.push(metadata.cdn1 + "/" + f.name);
  })
  return files;
}

function getExtensions(links) {
  const exts = new Set();
  links.forEach((s) => {
    const ext = s.split('.').pop();
    exts.add(ext);
  })
  return exts;
}

function filterExtensions(exts, links) {
  const matched = [];
  links.forEach((s) => {
    const ext = s.split('.').pop();
    if (exts.has(ext)) {
      matched.push(s);
    }
  })
  return matched;
}

document.querySelector("#id-url").oninput = function(e) {
  const identifer = toIdentifier(e.target.value);
  const lookup = document.querySelector("#id-lookup");
  if (identifer !== undefined) {
    e.target.classList.remove("is-invalid");
    e.target.classList.add("is-valid");
    lookup.removeAttribute("disabled");
  } else {
    e.target.classList.remove("is-valid");
    e.target.classList.add("is-invalid");
    lookup.setAttribute("disabled", "disabled");
  }
}

document.querySelector("#id-lookup").onclick = function() {
  const url = document.querySelector("#id-url").value;
  const identifier = toIdentifier(url);
  console.log(identifier);
  if (identifier !== undefined) {
    getMetadata(identifier).then((res) => {
      const links = getFileLinks(res);
      const exts = getExtensions(links);
      const filtered = filterExtensions(exts, links);
      const results = document.querySelector("#id-results");
      results.removeAttribute("disabled");
      results.value = filtered.join("\n");
    })
  }
}
