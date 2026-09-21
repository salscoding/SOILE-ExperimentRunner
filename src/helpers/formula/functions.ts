/**
 * General Function definition
 */
export interface FilterFunction {
  name: string;
  symbol: string;
  isArgCountAllowed(argcount: number): boolean;
}

const MEAN = {
  name: "mean",
  symbol: "mean( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount > 0;
  },
};

const MEDIAN = {
  name: "median",
  symbol: "median( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount > 0;
  },
};

const MAX = {
  name: "max",
  symbol: "max( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount >= 2;
  },
};

const MIN = {
  name: "min",
  symbol: "min( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount >= 2;
  },
};

const SQUAREROOT = {
  name: "sqrt",
  symbol: "sqrt( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount == 1;
  },
};

const EXPONENT = {
  name: "exp",
  symbol: "exp( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount == 2;
  },
};

const APPROX = {
  name: "approx",
  symbol: "approx( )",
  isArgCountAllowed(argcount: number): boolean {
    return argcount == 3;
  },
};

export const FilterFunctions: FilterFunction[] = [
  EXPONENT,
  SQUAREROOT,
  MEDIAN,
  MEAN,
  MAX,
  MIN,
  APPROX,
];
