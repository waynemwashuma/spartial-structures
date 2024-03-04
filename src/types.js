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
 
 /**
  * @template T
  * @template U
  * @template V
  * @callback CollisionChecker
  * @param {Client<U,T>} client1
  * @param {Client<U,T>} client2
  * @return {V}
 */