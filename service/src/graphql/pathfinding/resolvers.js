import * as PF from 'pathfinding'
import { uuid } from 'uuidv4'

export const resolver = {
  Query: {
    astarFinder: async (
      parent,
      {
        numRows,
        numColumns,
        unwalkableLocations,
        origin,
        target,
        allowDiagonal,
        dontCrossCorners
      }
    ) => {
      const grid = new PF.Grid(numRows, numColumns)
      unwalkableLocations.forEach(location => {
        const { x, y } = location
        grid.setWalkableAt(x, y, false)
      })

      const finder = new PF.AStarFinder({ allowDiagonal, dontCrossCorners })

      const { x: originX, y: originY } = origin
      const { x: targetX, y: targetY } = target
      const path = finder.findPath(originX, originY, targetX, targetY, grid)

      return {
        id: uuid(),
        locations: path.map((loc, key) => {
          return {
            id: '(' + loc[0] + ',' + loc[1] + ')-order-' + key,
            location: {
              id: '(' + loc[0] + ',' + loc[1] + ')',
              x: loc[0],
              y: loc[1]
            },
            order: key
          }
        })
      }
    }
  }
}
