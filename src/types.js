import { BoundingBox } from "../chaos.module";
import { Client } from "./client";

/**
 * @template T
 * @template U
 * @callback QueryFunc
 * @param {Client<U,T>} client
 * @param {BoundingBox} bound
 * @returns {boolean}
 */

/**
 * @template T
 * @template U
 * @callback TraverserFunc
 * @param {T} node
 * @param {U} out
 * @returns {void}
 */