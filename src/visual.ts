/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
'use strict';

/**
 * [ ] only import necessary d3 module
 * [ ] create interface / default/initial values
 * [ ] Make many links style (straight, curved...)
 * [?] apply force simulation
 */

import 'core-js/stable';
import './../style/visual.less';
// d3
import * as d3 from 'd3';

import { ValueFn, tree, svg } from 'd3';
import { ScaleLinear } from 'd3-scale';

import powerbi from 'powerbi-visuals-api';
// powerbi.extensibility.visual
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
// powerbi
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import { VisualSettings } from './settings';
// import json file https://mariusschulz.com/blog/importing-json-modules-in-typescript#importing-json-files-via-static-import-declarations
import * as data from '../test/data.json';

interface radialTree {}

let initialRadialTreeValues: radialTree = {};

export class Visual implements IVisual {
  private target: HTMLElement;
  private updateCount: number;
  private settings: VisualSettings;
  private textNode: Text;
  // svg added by d3
  private svg: any;

  constructor(options: VisualConstructorOptions) {
    console.log('Visual constructor', options);
    console.log('testing the data');
    console.log(data);

    this.target = options.element;
    this.updateCount = 0;
    if (typeof document !== 'undefined') {
      // create svg element
      this.svg = this.createSvg(this.target);
      this.createRadiusTree(this.target, data);
    } else {
      console.error('Document is undefined');
    }

    // testing happens here
    // d3.tree();
  }

  private createSvg(selector, width: number = 500, height: number = 500) {
    // this.svg = d3
    //   .select(selector)
    //   .append('svg')
    //   .style('width', '100%')
    //   .style('height', '100%')
    //   // add font style
    //   .attr('id', 'radial-tree');

    return d3
      .select(selector)
      .append('svg')
      .style('width', '100%')
      .style('height', '100%')
      .style('font', '10px sans-serif')
      .style('margin', '5px')
      .attr('id', 'radial-tree');
    // .style('height', 'auto')
    // .style('max-width', '100%')

    // let firstG = this.svg.append('g').attr('transform', 'translate(0, 0)');
    // firstG.append('g').classed('links', true);
    // firstG.append('g').classed('nodes', true);
  }

  public createRadiusTree(container, data) {
    const width = 932;
    // const height = 500;
    let radius = width / 2;
    const diameter = 300;

    var dataTest = {
      name: 'ROOT',
      children: [
        {
          name: 'B1',
          children: [
            {
              name: 'C1',
              value: 100,
              children: [
                {
                  name: 'B2',
                  value: 200,
                  children: [
                    {
                      name: 'B2',
                      value: 200
                    },
                    {
                      name: 'B2',
                      value: 200
                    }
                  ]
                },
                {
                  name: 'B2',
                  value: 200
                }
              ]
            },
            {
              name: 'C2',
              value: 300
            },
            {
              name: 'C3',
              value: 200
            },
            {
              name: 'C4',
              value: 200
            }
          ]
        }
      ]
    };

    console.log('this is the dataset');
    console.log(data);

    // Create tree - Configure size
    const tree = d3
      .tree()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    /**
     * Construct root node
     * {@link https://github.com/d3/d3-hierarchy/blob/v1.1.8/README.md#hierarchy}
     */
    const root = d3.hierarchy(data);

    // console.group('%c Testing root', 'color: red');
    // let myScale = d3
    //   .scaleLinear()
    //   .domain([0, 10])
    //   .range([0, 600]);
    // console.log(myScale(5.5));
    // console.groupEnd();

    //
    /**
     * Lays out the specified root
     * {@link https://github.com/d3/d3-hierarchy/blob/v1.1.8/README.md#_tree}
     */
    tree(root);

    // Create Links
    this.svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr(
        'd',
        d3
          .linkRadial()
          .angle((d: any) => d.x)
          .radius((d: any) => d.y)
      );

    // Create Nodes
    const node = this.svg
      .append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants().reverse())
      .join('g')
      .attr(
        'transform',
        d => `
      rotate(${(d.x * 180) / Math.PI - 90})
      translate(${d.y},0)
    `
      );
    
    node
      .append('circle')
      .attr('fill', d => (d.children ? '#555' : '#999'))
      .attr('r', 2.5);

    // Add Text
    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', d => (d.x < Math.PI === !d.children ? 6 : -6))
      .attr('text-anchor', d =>
        d.x < Math.PI === !d.children ? 'start' : 'end'
      )
      .attr('transform', d => (d.x >= Math.PI ? 'rotate(180)' : null))
      .text(d => d.data.name)
      .clone(true)
      .lower()
      .attr('stroke', 'white');

    this.svg.attr("viewBox", autoBox);

    function autoBox() {
      const { x, y, width, height } = this.getBBox();
      return [x, y, width, height];
    }

    // .select('svg g')
    // .selectAll('line.link')
    // .data(root.links())
    // .enter()
    // .append('line')
    // .style('stroke', 'red')
    // .classed('link', true)
    // .attr('x1', function(d: any) {
    //   return d.source.x;
    // })
    // .attr('y1', function(d: any) {
    //   return d.source.y;
    // })
    // .attr('x2', function(d: any) {
    //   return d.target.x;
    // })
    // .attr('y2', function(d: any) {
    //   return d.target.y;
    // });

    // -------------------------
    // create a radial tree
    // d3.tree()
    // .size([360, diameter / 2])
    // .separation((a, b) => {
    //   return a.parent
    // });

    // create tree
    // const tree = data =>
    //   d3
    //     .tree()
    //     .size([2 * Math.PI, radius])
    //     .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)(
    //     d3.hierarchy(data)
    //   );

    // // give data to tree
    // const root = tree(data);

    // // create links
    // const link = this.svg
    //   .append('g')
    //   .attr('fill', 'none')
    //   .attr('stroke', '#555')
    //   .attr('stroke-opacity', 0.4)
    //   .attr('stroke-width', 1.5)
    //   .selectAll('path')
    //   .data(root.links())
    //   .join('path')
    //   .attr(
    //     'd',
    //     d3
    //       .linkRadial()
    //       .angle((d: any) => d.x)
    //       .radius((d: any) => d.y)
    //   );

    // // svg.attr('viewBox', function() {
    // //   const { x, y, width, height } = this.getBBox();
    // //   return [x, y, width, height];
    // // } as any);

    // function* count () { const svg = d3.create("svg")
    //   .style("max-width", "100%")
    //   .style("height", "auto")
    //   .style("font", "10px sans-serif")
    //   .style("margin", "5px");

    //   yield svg.node();
    // }

    // svg.attr('viewBox', autoBox as any);
    // // set box size
    // function autoBox() {
    //   const { x, y, width, height } = this.getBBox();
    //   return [x, y, width, height];
    // }
  }

  public update(options: VisualUpdateOptions) {
    this.settings = Visual.parseSettings(
      options && options.dataViews && options.dataViews[0]
    );
    console.log('Visual update', options);
    if (typeof this.textNode !== 'undefined') {
      this.textNode.textContent = (this.updateCount++).toString();
    }
  }

  private static parseSettings(dataView: DataView): VisualSettings {
    return VisualSettings.parse(dataView) as VisualSettings;
  }

  /**
   * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
   * objects and properties you want to expose to the users in the property pane.
   *
   */
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    return VisualSettings.enumerateObjectInstances(
      this.settings || VisualSettings.getDefault(),
      options
    );
  }
}
