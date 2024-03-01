import { BoundingBox } from "../chaos.module.js";
import { Client } from "./client.js";

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