const TABLE_INSERT_REGEX = /INSERT INTO `([^`]+)` VALUES\s*([\s\S]*?);/g;

const unescapeMysqlString = (value) =>
  value
    .replace(/\\0/g, "\0")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\Z/g, "\u001A")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");

const convertToken = (token) => {
  const trimmed = token.trim();

  if (trimmed.length === 0 || /^null$/i.test(trimmed)) {
    return null;
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
};

const parseTupleList = (valuesSection) => {
  const rows = [];
  let row = [];
  let buffer = "";
  let inString = false;
  let escape = false;
  let depth = 0;

  const pushToken = () => {
    row.push(convertToken(buffer));
    buffer = "";
  };

  for (let i = 0; i < valuesSection.length; i += 1) {
    const char = valuesSection[i];

    if (inString) {
      if (escape) {
        buffer += char;
        escape = false;
        continue;
      }

      if (char === "\\") {
        escape = true;
        continue;
      }

      if (char === "'") {
        inString = false;
        continue;
      }

      buffer += char;
      continue;
    }

    if (char === "'") {
      inString = true;
      continue;
    }

    if (char === "(") {
      depth += 1;
      if (depth === 1) {
        row = [];
        buffer = "";
        continue;
      }
    }

    if (char === ")" && depth === 1) {
      pushToken();
      rows.push(row);
      row = [];
      buffer = "";
      depth = 0;
      continue;
    }

    if (char === "," && depth === 1) {
      pushToken();
      continue;
    }

    if (depth === 1) {
      buffer += char;
    }
  }

  return rows.map((entry) =>
    entry.map((value) => (typeof value === "string" ? unescapeMysqlString(value) : value)),
  );
};

const extractTableInserts = (dumpText, tableName) => {
  const rows = [];
  let match;

  TABLE_INSERT_REGEX.lastIndex = 0;
  while ((match = TABLE_INSERT_REGEX.exec(dumpText)) !== null) {
    if (match[1] !== tableName) {
      continue;
    }

    rows.push(...parseTupleList(match[2]));
  }

  return rows;
};

module.exports = {
  extractTableInserts,
  parseTupleList,
  unescapeMysqlString,
};
