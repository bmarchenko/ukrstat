AmCharts.maps = {};
AmCharts.AmMap = AmCharts.Class({
    inherits: AmCharts.AmChart,
    construct: function () {
        this.version = "3.0.7";
        this.svgNotSupported = "This browser doesn't support SVG. Use Chrome, Firefox, Internet Explorer 9 or later.";
        this.createEvents("rollOverMapObject", "rollOutMapObject", "clickMapObject", "selectedObjectChanged", "homeButtonClicked", "zoomCompleted", "writeDevInfo");
        this.zoomDuration = 1;
        this.zoomControl = new AmCharts.ZoomControl;
        this.fitMapToContainer = !0;
        this.mouseWheelZoomEnabled = this.backgroundZoomsToTop = !1;
        this.useHandCursorOnClickableOjects = this.showBalloonOnSelectedObject = !0;
        this.showObjectsAfterZoom = this.wheelBusy = !1;
        this.zoomOnDoubleClick = this.useObjectColorForBalloon = !0;
        this.allowMultipleDescriptionWindows = !1;
        this.dragMap = this.centerMap = !0;
        this.colorSteps = 5;
        this.showAreasInList = !0;
        this.showLinesInList = this.showImagesInList = !1;
        this.areasProcessor = new AmCharts.AreasProcessor(this);
        this.areasSettings = new AmCharts.AreasSettings;
        this.imagesProcessor = new AmCharts.ImagesProcessor(this);
        this.imagesSettings = new AmCharts.ImagesSettings;
        this.linesProcessor = new AmCharts.LinesProcessor(this);
        this.linesSettings = new AmCharts.LinesSettings;
        this.showDescriptionOnHover = !1;
        AmCharts.AmMap.base.construct.call(this);
        this.product = "";
        AmCharts.bezierX = 3;
        AmCharts.bezierY = 3;
        AmCharts.dx = 0.5;
        AmCharts.dy = 0.5
    },
    initChart: function () {
        this.zoomInstantly = !0;
        if (this.sizeChanged && AmCharts.hasSVG && this.chartCreated) {
            this.container.setSize(this.realWidth, this.realHeight);
            this.resizeMap();
            this.drawBackground();
            this.redrawLabels();
            this.drawTitles();
            this.processObjects();
            this.rescaleObjects();
            var a = this.container;
            this.zoomControl.init(this, a);
            this.drawBg();
            var b = this.smallMap;
            b && b.init(this, a);
            (b = this.valueLegend) && b.init(this, a);
            this.sizeChanged = !1;
            this.zoomToLongLat(this.zLevelTemp, this.zLongTemp, this.zLatTemp, !0);
            this.previousWidth = this.realWidth;
            this.previousHeight = this.realHeight;
            this.drb();
            this.updateSmallMap();
            this.linkSet.toFront()
        } else if (AmCharts.AmMap.base.initChart.call(this), AmCharts.hasSVG) {
            if (this.dataChanged && (this.parseData(), this.dispatchDataUpdated = !0, this.dataChanged = !1, a = this.legend)) a.position = "absolute", a.invalidateSize();
            this.addMouseWheel();
            this.createDescriptionsDiv();
            this.svgAreas = [];
            this.svgAreasById = {};
            this.drawChart()
        } else document.createTextNode(this.svgNotSupported), this.chartDiv.style.textAlign = "", this.chartDiv.setAttribute("class", "ammapAlert"), this.chartDiv.innerHTML = this.svgNotSupported
    },
    invalidateSize: function () {
        var a = this.zoomLongitude();
        isNaN(a) || (this.zLongTemp = a);
        a = this.zoomLatitude();
        isNaN(a) || (this.zLatTemp = a);
        a = this.zoomLevel();
        isNaN(a) || (this.zLevelTemp = a);
        AmCharts.AmMap.base.invalidateSize.call(this)
    },
    addMouseWheel: function () {
        var a = this;
        a.mouseWheelZoomEnabled && (window.addEventListener && window.addEventListener("DOMMouseScroll", function (b) {
            a.handleWheel.call(a, b)
        }, !1), window.onmousewheel && (window.onmousewheel = document.onmousewheel = a.handleWheel.call(a)))
    },
    handleWheel: function (a) {
        if (this.mouseIsOver) {
            var b = 0;
            a || (a = window.event);
            a.wheelDelta ? b = a.wheelDelta / 120 : a.detail && (b = -a.detail / 3);
            b && this.handleWheelReal(b);
            a.preventDefault && a.preventDefault();
            a.returnValue = !1
        }
    },
    handleWheelReal: function (a) {
        if (!this.wheelBusy) {
            this.stopAnimation();
            var b = this.zoomLevel(),
                c = this.zoomControl,
                d = c.zoomFactor;
            this.wheelBusy = !0;
            a = AmCharts.fitToBounds(0 < a ? b * d : b / d, c.minZoomLevel, c.maxZoomLevel);
            d = this.mouseX / this.mapWidth;
            c = this.mouseY / this.mapHeight;
            d = (this.zoomX() - d) * (a / b) + d;
            b = (this.zoomY() - c) * (a / b) + c;
            this.zoomTo(a, d, b)
        }
    },
    addLegend: function (a) {
        a.position = "absolute";
        a.autoMargins = !1;
        a.valueWidth = 0;
        a.switchable = !1;
        AmCharts.AmMap.base.addLegend.call(this, a)
    },
    handleLegendEvent: function () {},
    createDescriptionsDiv: function () {
        var a = document.createElement("div");
        this.div.appendChild(a);
        this.descriptionsDiv = a
    },
    drawChart: function () {
        AmCharts.AmMap.base.drawChart.call(this);
        var a = this.dataProvider;
        AmCharts.extend(a, new AmCharts.MapData);
        AmCharts.extend(this.areasSettings, new AmCharts.AreasSettings);
        AmCharts.extend(this.imagesSettings, new AmCharts.ImagesSettings);
        AmCharts.extend(this.linesSettings, new AmCharts.LinesSettings);
        this.mapContainer = this.container.set();
        this.graphsSet.push(this.mapContainer);
        var b = a.mapVar;
        b ? (this.svgData = b.svg, this.getBounds(), this.buildEverything()) : (a = a.mapURL) && this.loadXml(a)
    },
    drawBg: function () {
        var a = this;
        AmCharts.remove(a.bgSet);
        var b = AmCharts.rect(a.container, a.realWidth, a.realHeight, "#000", 0.001);
        b.click(function () {
            a.handleBackgroundClick()
        });
        a.bgSet = b;
        a.set.push(b)
    },
    buildEverything: function () {
        var a = this;
        if (0 < a.realWidth && 0 < a.realHeight) {
            var b = a.container;
            a.zoomControl.init(this, b);
            a.drawBg();
            a.buildSVGMap();
            var c = a.smallMap;
            c && c.init(a, b);
            c = a.dataProvider;
            isNaN(c.zoomX) && (isNaN(c.zoomY) && isNaN(c.zoomLatitude) && isNaN(c.zoomLongitude)) && (a.centerMap ? (c.zoomLatitude = a.coordinateToLatitude(a.mapHeight / 2), c.zoomLongitude = a.coordinateToLongitude(a.mapWidth / 2)) : (c.zoomX = 0, c.zoomY = 0), a.zoomInstantly = !0);
            a.selectObject(a.dataProvider);
            a.processAreas();
            (c = a.valueLegend) && c.init(a, b);
            if (b = a.objectList) a.clearObjectList(), b.init(a);
            clearInterval(a.interval);
            a.interval = setInterval(function () {
                    a.update.call(a)
                },
                AmCharts.updateRate);
            a.dispDUpd();
            a.linkSet.toFront();
            a.chartCreated = !0
        } else a.cleanChart()
    },
    hideGroup: function (a) {
        this.showHideGroup(a, !1)
    },
    showGroup: function (a) {
        this.showHideGroup(a, !0)
    },
    showHideGroup: function (a, b) {
        this.showHideReal(this.imagesProcessor.allObjects, a, b);
        this.showHideReal(this.areasProcessor.allObjects, a, b);
        this.showHideReal(this.linesProcessor.allObjects, a, b)
    },
    showHideReal: function (a, b, c) {
        var d;
        for (d = 0; d < a.length; d++) {
            var e = a[d];
            e.groupId == b && (c ? e.displayObject.show() : e.displayObject.hide())
        }
    },
    update: function () {
        this.zoomControl.update()
    },
    animateMap: function () {
        var a = this;
        a.totalFrames = 1E3 * a.zoomDuration / AmCharts.updateRate;
        a.totalFrames += 1;
        a.frame = 0;
        a.tweenPercent = 0;
        setTimeout(function () {
            a.updateSize.call(a)
        }, AmCharts.updateRate)
    },
    updateSize: function () {
        var a = this,
            b = a.totalFrames;
        a.frame <= b ? (a.frame++, b = a.container.easeOutSine(0, a.frame, 0, 1, b), 1 <= b ? (b = 1, a.wheelBusy = !1) : setTimeout(function () {
            a.updateSize.call(a)
        }, AmCharts.updateRate)) : (b = 1, a.wheelBusy = !1);
        a.tweenPercent = b;
        a.rescaleMapAndObjects()
    },
    rescaleMapAndObjects: function () {
        var a = this.initialScale,
            b = this.initialX,
            c = this.initialY,
            d = this.tweenPercent;
        this.mapContainer.translate(b + (this.finalX - b) * d, c + (this.finalY - c) * d, a + (this.finalScale - a) * d);
        this.rescaleObjects();
        this.updateSmallMap();
        1 == d && (a = {
            type: "zoomCompleted",
            chart: this
        }, this.fire(a.type, a))
    },
    updateSmallMap: function () {
        this.smallMap && this.smallMap.update()
    },
    rescaleObjects: function () {
        var a = this.mapContainer.scale,
            b = this.imagesProcessor.objectsToResize,
            c;
        for (c = 0; c < b.length; c++) {
            var d = b[c].image;
            d.translate(d.x, d.y, b[c].scale / a, !0)
        }
        b = this.linesProcessor;
        if (d = b.linesToResize) for (c = 0; c < d.length; c++) {
            var e = d[c];
            e.line.setAttr("stroke-width", e.thickness / a)
        }
        b = b.objectsToResize;
        for (c = 0; c < b.length; c++) d = b[c], d.translate(d.x, d.y, 1 / a)
    },
    handleTouchStart: function (a) {
        this.handleMouseMove(a);
        this.handleMouseDown(a)
    },
    handleTouchEnd: function (a) {
        this.previousDistance = NaN;
        this.handleReleaseOutside(a)
    },
    handleMouseDown: function (a) {
        if (this.chartCreated && this.mouseIsOver && (AmCharts.resetMouseOver(),
            this.mouseIsOver = !0, this.dragMap && (this.stopAnimation(), this.isDragging = !0, this.mapContainerClickX = this.mapContainer.x, this.mapContainerClickY = this.mapContainer.y, this.panEventsEnabled || a && a.preventDefault && a.preventDefault()), a || (a = window.event), a.shiftKey && !0 === this.developerMode && this.getDevInfo(), a && a.touches)) {
            var b = this.mouseX,
                c = this.mouseY,
                d = a.touches.item(1);
            d && (a = d.pageX - AmCharts.findPosX(this.div), d = d.pageY - AmCharts.findPosY(this.div), this.middleXP = (b + (a - b) / 2) / this.realWidth, this.middleYP = (c + (d - c) / 2) / this.realHeight)
        }
    },
    stopDrag: function () {
        this.isDragging = !1
    },
    handleReleaseOutside: function () {
        this.isDragging = !1;
        this.zoomControl.draggerUp();
        this.mapWasDragged = !1;
        var a = this.mapContainer,
            b = this.mapContainerClickX,
            c = this.mapContainerClickY;
        if (!isNaN(b) && !isNaN(c) && (2 < Math.abs(a.x - b) || Math.abs(a.y - c))) this.mapWasDragged = !0;
        this.mapContainerClickY = this.mapContainerClickX = NaN;
        this.objectWasClicked = !1;
        this.zoomOnDoubleClick && this.mouseIsOver && (a = (new Date).getTime(), 200 > a - this.previousClickTime && 20 < a - this.previousClickTime && this.doDoubleClickZoom(), this.previousClickTime = a)
    },
    handleTouchMove: function (a) {
        this.handleMouseMove(a)
    },
    resetPinch: function () {
        this.mapWasPinched = !1
    },
    handleMouseMove: function (a) {
        var b = this;
        AmCharts.AmMap.base.handleMouseMove.call(b, a);
        var c = b.previuosMouseX,
            d = b.previuosMouseY,
            e = b.mouseX,
            f = b.mouseY;
        isNaN(c) && (c = e);
        isNaN(d) && (d = f);
        b.mouse2X = NaN;
        b.mouse2Y = NaN;
        if (a && a.touches) {
            var g = a.touches.item(1);
            g && (b.mouse2X = g.pageX - AmCharts.findPosX(b.div), b.mouse2Y = g.pageY - AmCharts.findPosY(b.div))
        }
        var g = b.mapContainer,
            h = b.mouse2X,
            j = b.mouse2Y;
        b.pinchTO && clearTimeout(b.pinchTO);
        b.pinchTO = setTimeout(function () {
            b.resetPinch.call(b)
        }, 1E3);
        if (!isNaN(h)) {
            b.isDragging = !1;
            a.preventDefault && a.preventDefault();
            var h = Math.sqrt(Math.pow(h - e, 2) + Math.pow(j - f, 2)),
                k = b.previousDistance,
                j = Math.max(b.realWidth, b.realHeight);
            5 > Math.abs(k - h) && (b.isDragging = !0);
            if (!isNaN(k)) {
                var l = 5 * Math.abs(k - h) / j,
                    j = g.scale,
                    j = k < h ? j + j * l : j - j * l,
                    k = b.zoomLevel(),
                    p = b.middleXP,
                    l = b.middleYP,
                    x = b.realHeight / b.mapHeight,
                    q = b.realWidth / b.mapWidth,
                    p = (b.zoomX() - p * q) * (j / k) + p * q,
                    l = (b.zoomY() - l * x) * (j / k) + l * x;
                0.1 < Math.abs(j - k) && (b.zoomTo(j, p, l, !0), b.mapWasPinched = !0, clearTimeout(b.pinchTO))
            }
            b.previousDistance = h
        }
        b.isDragging && (b.hideBalloon(), g.translate(g.x + (e - c), g.y + (f - d), g.scale), b.updateSmallMap(), a && a.preventDefault && a.preventDefault());
        b.previuosMouseX = e;
        b.previuosMouseY = f
    },
    selectObject: function (a) {
        var b = this;
        a || (a = b.dataProvider);
        var c = a.linkToObject;
        a.useTargetsZoomValues && c && (a.zoomX = c.zoomX, a.zoomY = c.zoomY, a.zoomLatitude = c.zoomLatitude, a.zoomLongitude = c.zoomLongitude, a.zoomLevel = c.zoomLevel);
        var d = b.selectedObject;
        d && b.returnInitialColor(d);
        b.selectedObject = a;
        var e = !1;
        "MapArea" == a.objectType && a.autoZoomReal && (e = !0);
        if (c && !e && ("string" == typeof c && (c = b.getObjectById(c)), isNaN(a.zoomLevel) && isNaN(a.zoomX) && isNaN(a.zoomY))) {
            if (b.extendMapData(c)) return;
            b.selectObject(c);
            return
        }
        b.allowMultipleDescriptionWindows || b.closeAllDescriptions();
        clearTimeout(b.selectedObjectTimeOut);
        clearTimeout(b.processObjectsTimeOut);
        c = b.zoomDuration;
        e || !isNaN(a.zoomLevel) || !isNaN(a.zoomX) || !isNaN(a.zoomY) ? (b.selectedObjectTimeOut = setTimeout(function () {
            b.showDescriptionAndGetUrl.call(b)
        }, 1E3 * c + 200), b.showObjectsAfterZoom ? b.processObjectsTimeOut = setTimeout(function () {
            b.processObjects.call(b)
        }, 1E3 * c + 200) : b.processObjects()) : (b.showDescriptionAndGetUrl(), b.processObjects());
        (e = a.displayObject) ? (e.setAttr("stroke", a.outlineColorReal), c = a.selectedColorReal, void 0 !== c && e.setAttr("fill", c), a.selectable || (e.setAttr("cursor", "default"), (e = a.imageLabel) && e.setAttr("cursor", "default"))) : b.returnInitialColorReal(a);
        if (e = a.groupId) {
            var c = b.getGroupById(e),
                f;
            for (f = 0; f < c.length; f++) {
                var g = c[f];
                if (e = g.displayObject) {
                    var h = g.selectedColorReal;
                    void 0 !== h ? e.setAttr("fill", h) : b.returnInitialColor(g)
                }
            }
        }
        b.zoomToSelectedObject();
        d != a && (a = {
            type: "selectedObjectChanged",
            chart: b
        }, b.fire(a.type, a))
    },
    returnInitialColor: function (a, b) {
        this.returnInitialColorReal(a);
        b && (a.isFirst = !1);
        var c = a.groupId;
        if (c) {
            var c = this.getGroupById(c),
                d;
            for (d = 0; d < c.length; d++) this.returnInitialColorReal(c[d]), b && (c[d].isFirst = !1)
        }
    },
    closeAllDescriptions: function () {
        this.descriptionsDiv.innerHTML = ""
    },
    returnInitialColorReal: function (a) {
        a.isOver = !1;
        var b = a.displayObject;
        if (b) {
            if ("MapImage" == a.objectType) {
                var c = a.tempScale;
                isNaN(c) || b.translate(b.x, b.y, c, !0)
            }
            c = a.colorReal;
            a.showAsSelected && (c = a.selectedColorReal);
            "bubble" == a.type && (c = void 0);
            void 0 !== c && b.setAttr("fill", c);
            var d = a.image;
            d && d.setAttr("fill", c);
            b.setAttr("stroke", a.outlineColorReal);
            (b = a.imageLabel) && !a.labelInactive && b.setAttr("fill", a.labelColorReal)
        }
    },
    zoomToRectangle: function (a,
                               b, c, d) {
        var e = this.realWidth,
            f = this.realHeight,
            g = this.mapSet.scale,
            h = this.zoomControl,
            e = AmCharts.fitToBounds(c / e > d / f ? 0.8 * e / (c * g) : 0.8 * f / (d * g), h.minZoomLevel, h.maxZoomLevel);
        this.zoomToMapXY(e, (a + c / 2) * g, (b + d / 2) * g)
    },
    zoomToLatLongRectangle: function (a, b, c, d) {
        var e = this.dataProvider,
            f = this.zoomControl,
            g = Math.abs(c - a),
            h = Math.abs(b - d),
            j = Math.abs(e.rightLongitude - e.leftLongitude),
            e = Math.abs(e.topLatitude - e.bottomLatitude),
            f = AmCharts.fitToBounds(g / j > h / e ? 0.8 * j / g : 0.8 * e / h, f.minZoomLevel, f.maxZoomLevel);
        this.zoomToLongLat(f,
            a + (c - a) / 2, d + (b - d) / 2)
    },
    getGroupById: function (a) {
        var b = [];
        this.getGroup(this.imagesProcessor.allObjects, a, b);
        this.getGroup(this.linesProcessor.allObjects, a, b);
        this.getGroup(this.areasProcessor.allObjects, a, b);
        return b
    },
    zoomToGroup: function (a) {
        a = this.getGroupById(a);
        var b, c, d, e, f;
        for (f = 0; f < a.length; f++) {
            var g = a[f].displayObject.getBBox(),
                h = g.y,
                j = g.y + g.height,
                k = g.x,
                g = g.x + g.width;
            if (h < b || isNaN(b)) b = h;
            if (j > e || isNaN(e)) e = j;
            if (k < c || isNaN(c)) c = k;
            if (g > d || isNaN(d)) d = g
        }
        a = this.mapSet.getBBox();
        c -= a.x;
        d -= a.x;
        e -= a.y;
        b -= a.y;
        this.zoomToRectangle(c, b, d - c, e - b)
    },
    getGroup: function (a, b, c) {
        if (a) {
            var d;
            for (d = 0; d < a.length; d++) {
                var e = a[d];
                e.groupId == b && c.push(e)
            }
        }
    },
    zoomToStageXY: function (a, b, c, d) {
        if (!this.objectWasClicked) {
            var e = this.zoomLevel();
            c = this.coordinateToLatitude((c - this.mapContainer.y) / e);
            b = this.coordinateToLongitude((b - this.mapContainer.x) / e);
            this.zoomToLongLat(a, b, c, d)
        }
    },
    zoomToLongLat: function (a, b, c, d) {
        b = this.longitudeToCoordinate(b);
        c = this.latitudeToCoordinate(c);
        this.zoomToMapXY(a, b, c, d)
    },
    zoomToMapXY: function (a,
                           b, c, d) {
        var e = this.mapWidth,
            f = this.mapHeight;
        this.zoomTo(a, -(b / e) * a + this.realWidth / e / 2, -(c / f) * a + this.realHeight / f / 2, d)
    },
    zoomToSelectedObject: function () {
        var a = this.selectedObject,
            b = a.zoomLatitude,
            c = a.zoomLongitude,
            d = a.zoomLevel,
            e = this.zoomInstantly,
            f = a.zoomX,
            g = a.zoomY,
            h = this.realWidth,
            j = this.realHeight;
        isNaN(d) || (!isNaN(b) && !isNaN(c) ? this.zoomToLongLat(d, c, b, e) : this.zoomTo(d, f, g, e));
        this.zoomInstantly = !1;
        "MapImage" == a.objectType && isNaN(a.zoomX) && (isNaN(a.zoomY) && isNaN(a.zoomLatitude) && isNaN(a.zoomLongitude) && !isNaN(a.latitude) && !isNaN(a.longitude)) && this.zoomToLongLat(a.zoomLevel, a.longitude, a.latitude);
        "MapArea" == a.objectType && (f = a.displayObject.getBBox(), b = this.mapScale, c = f.x * b, d = f.y * b, e = f.width * b, f = f.height * b, h = a.autoZoomReal && isNaN(a.zoomLevel) ? e / h > f / j ? 0.8 * h / e : 0.8 * j / f : a.zoomLevel, j = this.zoomControl, h = AmCharts.fitToBounds(h, j.minZoomLevel, j.maxZoomLevel), isNaN(a.zoomX) && (isNaN(a.zoomY) && isNaN(a.zoomLatitude) && isNaN(a.zoomLongitude)) && (a = this.mapSet.getBBox(), this.zoomToMapXY(h, -a.x * b + c + e / 2, -a.y * b + d + f / 2)))
    },
    zoomTo: function (a, b, c, d) {
        var e = this.zoomControl;
        a = AmCharts.fitToBounds(a, e.minZoomLevel, e.maxZoomLevel);
        e = this.zoomLevel();
        isNaN(b) && (b = this.realWidth / this.mapWidth, b = (this.zoomX() - 0.5 * b) * (a / e) + 0.5 * b);
        isNaN(c) && (c = this.realHeight / this.mapHeight, c = (this.zoomY() - 0.5 * c) * (a / e) + 0.5 * c);
        this.stopAnimation();
        isNaN(a) || (e = this.mapContainer, this.initialX = e.x, this.initialY = e.y, this.initialScale = e.scale, this.finalX = this.mapWidth * b, this.finalY = this.mapHeight * c, this.finalScale = a, this.finalX != this.initialX || this.finalY != this.initialY || this.finalScale != this.initialScale ? d ? (this.tweenPercent = 1, this.rescaleMapAndObjects(), this.wheelBusy = !1) : this.animateMap() : this.wheelBusy = !1)
    },
    loadXml: function (a) {
        var b;
        b = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
        b.overrideMimeType && b.overrideMimeType("text/xml");
        b.open("GET", a, !1);
        b.send();
        this.parseXMLObject(b.responseXML);
        this.svgData && this.buildEverything()
    },
    stopAnimation: function () {
        this.frame = this.totalFrames
    },
    processObjects: function () {
        var a = this.container,
            b = this.stageObjectsContainer;
        b && b.remove();
        this.stageObjectsContainer = b = a.set();
        this.trendLinesSet.push(b);
        var c = this.mapObjectsContainer;
        c && c.remove();
        this.mapObjectsContainer = c = a.set();
        this.mapContainer.push(c);
        c.toFront();
        b.toFront();
        if (a = this.selectedObject) this.imagesProcessor.reset(), this.linesProcessor.reset(), this.imagesProcessor.process(a), this.linesProcessor.process(a);
        this.rescaleObjects()
    },
    processAreas: function () {
        this.areasProcessor.process(this.dataProvider)
    },
    buildSVGMap: function () {
        var a = this.svgData.g.path,
            b = this.container,
            c = b.set();
        void 0 === a.length && (a = [a]);
        var d;
        for (d = 0; d < a.length; d++) {
            var e = a[d],
                f = e.title,
                g = b.path(e.d);
            g.id = e.id;
            this.svgAreasById[e.id] = {
                area: g,
                title: f
            };
            this.svgAreas.push(g);
            c.push(g)
        }
        this.mapSet = c;
        this.mapContainer.push(c);
        this.resizeMap()
    },
    addObjectEventListeners: function (a, b) {
        var c = this;
        a.mouseup(function () {
            c.clickMapObject(b)
        }).mouseover(function () {
                c.rollOverMapObject(b)
            }).mouseout(function () {
                c.rollOutMapObject(b)
            }).touchend(function () {
                c.clickMapObject(b)
            }).touchstart(function () {
                c.rollOverMapObject(b)
            })
    },
    checkIfSelected: function (a) {
        var b = this.selectedObject;
        if (b == a) return !0;
        if (b = b.groupId) {
            var b = this.getGroupById(b),
                c;
            for (c = 0; c < b.length; c++) if (b[c] == a) return !0
        }
        return !1
    },
    clearMap: function () {
        this.chartDiv.innerHTML = "";
        this.clearObjectList()
    },
    clearObjectList: function () {
        var a = this.objectList;
        a && (a.div.innerHTML = "")
    },
    checkIfLast: function (a) {
        if (a) {
            var b = a.parentNode;
            if (b && b.lastChild == a) return !0
        }
        return !1
    },
    showAsRolledOver: function (a) {
        var b = a.displayObject;
        if (!a.showAsSelected && b && !a.isOver) {
            b.node.onmouseout = function () {};
            b.node.onmouseover = function () {};
            b.node.onclick = function () {};
            a.isFirst || (b.toFront(), a.isFirst = !0);
            var c = a.rollOverColorReal,
                d;
            void 0 != c && ("MapImage" == a.objectType ? (d = a.image) && d.setAttr("fill", c) : b.setAttr("fill", c));
            if ((d = a.imageLabel) && !a.labelInactive) c = a.labelRollOverColorReal, void 0 != c && d.setAttr("fill", c);
            c = a.rollOverOutlineColorReal;
            void 0 != c && ("MapImage" == a.objectType ? (d = a.image) && d.setAttr("stroke", c) : b.setAttr("stroke", c));
            "MapImage" == a.objectType && (d = a.rollOverScaleReal, isNaN(d) || (a.tempScale = b.scale, b.translate(b.x, b.y, b.scale * d, !0)));
            this.useHandCursorOnClickableOjects && (this.checkIfClickable(a) && this.selectedObject != a) && b.setAttr("cursor", "pointer");
            this.addObjectEventListeners(b, a);
            a.isOver = !0
        }
    },
    rollOverMapObject: function (a, b) {
        if (this.chartCreated) {
            this.handleMouseMove();
            var c = this.previouslyHovered;
            c && c != a && !1 === this.checkIfSelected(c) && (this.returnInitialColor(c, !0), this.previouslyHovered = null);
            if (!1 === this.checkIfSelected(a)) {
                if (c = a.groupId) {
                    var c = this.getGroupById(c),
                        d;
                    for (d = 0; d < c.length; d++) c[d] != a && this.showAsRolledOver(c[d])
                }
                this.showAsRolledOver(a)
            } else(c = a.displayObject) && c.setAttr("cursor", "default");
            if (this.showDescriptionOnHover) this.showDescription(a);
            else if ((this.showBalloonOnSelectedObject || !this.checkIfSelected(a)) && !1 !== b) if (d = a.balloonTextReal) if (c = this.balloon, (d = this.formatString(d, a)) && "" !== d) {
                var e = a.colorReal;
                void 0 !== e && this.useObjectColorForBalloon || (e = c.fillColor);
                clearTimeout(this.hoverInt);
                this.showBalloon(d, e, !0)
            }
            c = {
                type: "rollOverMapObject",
                mapObject: a,
                chart: this
            };
            this.fire(c.type, c);
            this.previouslyHovered = a
        }
    },
    rollOutMapObject: function (a) {
        this.hideBalloon();
        this.chartCreated && a.isOver && (this.checkIfSelected(a) || this.returnInitialColor(a), a = {
            type: "rollOutMapObject",
            mapObject: a,
            chart: this
        }, this.fire(a.type, a))
    },
    formatString: function (a, b) {
        var c = this.numberFormatter,
            d = this.percentFormatter,
            e = b.title;
        void 0 == e && (e = "");
        var f = b.value,
            f = isNaN(f) ? "" : AmCharts.formatNumber(f, c),
            c = b.percents,
            c = isNaN(c) ? "" : AmCharts.formatNumber(c, d),
            d = b.description;
        void 0 == d && (d = "");
        var g = b.customData;
        void 0 == g && (g = "");
        return a = AmCharts.massReplace(a, {
            "[[title]]": e,
            "[[value]]": f,
            "[[percent]]": c,
            "[[description]]": d,
            "[[customData]]": g
        })
    },
    clickMapObject: function (a) {
        this.hideBalloon();
        this.chartCreated && (!this.mapWasDragged && this.checkIfClickable(a) && !this.mapWasPinched) && (this.selectObject(a), a = {
            type: "clickMapObject",
            mapObject: a,
            chart: this
        }, this.fire(a.type, a), this.objectWasClicked = !0)
    },
    checkIfClickable: function (a) {
        return !0 === a.selectable ? !0 : this.selectedObject == a ? !1 : "MapArea" == a.objectType && a.autoZoomReal || null !== a.url || null !== a.linkToObject || (0 < a.images.length || 0 < a.lines.length) || (!isNaN(a.zoomLevel) || !isNaN(a.zoomX) || !isNaN(a.zoomY)) || a.description ? !0 : !1
    },
    resizeMap: function () {
        var a = this.mapSet;
        if (a) if (this.fitMapToContainer) {
            var b = a.getBBox(),
                c = this.realWidth,
                d = this.realHeight,
                e = b.width,
                f = b.height,
                c = e / c > f / d ? c / e : d / f;
            a.translate(-b.x * c, -b.y * c, c);
            this.mapScale = c;
            this.mapHeight = f * c;
            this.mapWidth = e * c
        } else b = group.transform.match(/([\-]?[\d.]+)/g), a.translate(b[0],
            b[1], b[2])
    },
    zoomIn: function () {
        var a = this.zoomLevel() * this.zoomControl.zoomFactor;
        this.zoomTo(a)
    },
    zoomOut: function () {
        var a = this.zoomLevel() / this.zoomControl.zoomFactor;
        this.zoomTo(a)
    },
    moveLeft: function () {
        var a = this.zoomX() + this.zoomControl.panStepSize;
        this.zoomTo(this.zoomLevel(), a, this.zoomY())
    },
    moveRight: function () {
        var a = this.zoomX() - this.zoomControl.panStepSize;
        this.zoomTo(this.zoomLevel(), a, this.zoomY())
    },
    moveUp: function () {
        var a = this.zoomY() + this.zoomControl.panStepSize;
        this.zoomTo(this.zoomLevel(),
            this.zoomX(), a)
    },
    moveDown: function () {
        var a = this.zoomY() - this.zoomControl.panStepSize;
        this.zoomTo(this.zoomLevel(), this.zoomX(), a)
    },
    zoomX: function () {
        return this.mapSet ? Math.round(1E4 * this.mapContainer.x / this.mapWidth) / 1E4 : NaN
    },
    zoomY: function () {
        return this.mapSet ? Math.round(1E4 * this.mapContainer.y / this.mapHeight) / 1E4 : NaN
    },
    goHome: function () {
        this.selectObject(this.dataProvider);
        var a = {
            type: "homeButtonClicked",
            chart: this
        };
        this.fire(a.type, a)
    },
    zoomLevel: function () {
        return Math.round(1E5 * this.mapContainer.scale) / 1E5
    },
    showDescriptionAndGetUrl: function () {
        var a = this.selectedObject;
        if (a) {
            this.showDescription();
            var b = a.url;
            if (b) AmCharts.getURL(b, a.urlTarget);
            else if (b = a.linkToObject) {
                if ("string" == typeof b) {
                    var c = this.getObjectById(b);
                    if (c) {
                        this.selectObject(c);
                        return
                    }
                }
                b && a.passZoomValuesToTarget && (b.zoomLatitude = this.zoomLatitude(), b.zoomLongitude = this.zoomLongitude(), b.zoomLevel = this.zoomLevel());
                this.extendMapData(b) || this.selectObject(b)
            }
        }
    },
    extendMapData: function (a) {
        var b = a.objectType;
        if ("MapImage" != b && "MapArea" != b && "MapLine" != b) return AmCharts.extend(a, new AmCharts.MapData), this.dataProvider = a, this.zoomInstantly = !0, this.validateData(), !0
    },
    showDescription: function (a) {
        a || (a = this.selectedObject);
        this.allowMultipleDescriptionWindows || this.closeAllDescriptions();
        if (a.description) {
            var b = a.descriptionWindow;
            b && b.close();
            b = new AmCharts.DescriptionWindow;
            a.descriptionWindow = b;
            var c = a.descriptionWindowWidth,
                d = a.descriptionWindowHeight,
                e = a.descriptionWindowX,
                f = a.descriptionWindowY;
            isNaN(e) && (e = this.mouseX, e = e > this.realWidth / 2 ? e - c - 20 : e + 20);
            isNaN(f) && (f = this.mouseY);
            b.maxHeight = d;
            b.show(this, this.descriptionsDiv, a.description, a.title);
            a = b.div.style;
            a.width = c + "px";
            a.maxHeight = d + "px";
            a.left = e + "px";
            a.top = f + "px"
        }
    },
    parseXMLObject: function (a) {
        var b = {
            root: {}
        };
        this.parseXMLNode(b, "root", a);
        this.svgData = b.root.svg;
        this.getBounds()
    },
    getBounds: function () {
        var a = this.dataProvider;
        try {
            var b = this.svgData.defs["amcharts:ammap"];
            a.leftLongitude = Number(b.leftLongitude);
            a.rightLongitude = Number(b.rightLongitude);
            a.topLatitude = Number(b.topLatitude);
            a.bottomLatitude = Number(b.bottomLatitude);
            a.projection = b.projection
        } catch (c) {}
    },
    latitudeToCoordinate: function (a) {
        var b, c = this.dataProvider;
        if (this.mapSet) {
            b = c.topLatitude;
            var d = c.bottomLatitude;
            "mercator" == c.projection && (a = this.mercatorLatitudeToCoordinate(a), b = this.mercatorLatitudeToCoordinate(b), d = this.mercatorLatitudeToCoordinate(d));
            b = (a - b) / (d - b) * this.mapHeight
        }
        return b
    },
    longitudeToCoordinate: function (a) {
        var b, c = this.dataProvider;
        this.mapSet && (b = c.leftLongitude, b = (a - b) / (c.rightLongitude - b) * this.mapWidth);
        return b
    },
    mercatorLatitudeToCoordinate: function (a) {
        89.5 < a && (a = 89.5); - 89.5 > a && (a = -89.5);
        a = AmCharts.degreesToRadians(a);
        a = 0.5 * Math.log((1 + Math.sin(a)) / (1 - Math.sin(a)));
        return AmCharts.radiansToDegrees(a / 2)
    },
    zoomLatitude: function () {
        return this.coordinateToLatitude((-this.mapContainer.y + this.previousHeight / 2) / this.zoomLevel())
    },
    zoomLongitude: function () {
        return this.coordinateToLongitude((-this.mapContainer.x + this.previousWidth / 2) / this.zoomLevel())
    },
    getAreaCenterLatitude: function (a) {
        a = a.displayObject.getBBox();
        var b = this.mapScale;
        a = -this.mapSet.getBBox().y * b + (a.y + a.height / 2) * b;
        return this.coordinateToLatitude(a)
    },
    getAreaCenterLongitude: function (a) {
        a = a.displayObject.getBBox();
        var b = this.mapScale;
        a = -this.mapSet.getBBox().x * b + (a.x + a.width / 2) * b;
        return this.coordinateToLongitude(a)
    },
    coordinateToLatitude: function (a) {
        var b;
        if (this.mapSet) {
            var c = this.dataProvider,
                d = c.bottomLatitude,
                e = c.topLatitude;
            b = this.mapHeight;
            "mercator" == c.projection ? (c = this.mercatorLatitudeToCoordinate(d), e = this.mercatorLatitudeToCoordinate(e),
                a = 2 * Math.atan(Math.exp(2 * (a * (c - e) / b + e) * Math.PI / 180)) - 0.5 * Math.PI, b = AmCharts.radiansToDegrees(a)) : b = a / b * (d - e) + e
        }
        return Math.round(1E6 * b) / 1E6
    },
    coordinateToLongitude: function (a) {
        var b, c = this.dataProvider;
        this.mapSet && (b = a / this.mapWidth * (c.rightLongitude - c.leftLongitude) + c.leftLongitude);
        return Math.round(1E6 * b) / 1E6
    },
    milesToPixels: function (a) {
        var b = this.dataProvider;
        return a * (this.mapWidth / (b.rightLongitude - b.leftLongitude)) / 69.172
    },
    kilometersToPixels: function (a) {
        var b = this.dataProvider;
        return a * (this.mapWidth / (b.rightLongitude - b.leftLongitude)) / 111.325
    },
    handleBackgroundClick: function () {
        if (this.backgroundZoomsToTop && !this.mapWasDragged) {
            var a = this.dataProvider;
            if (this.checkIfClickable(a)) this.clickMapObject(a);
            else {
                var b = a.zoomX,
                    c = a.zoomY,
                    d = a.zoomLongitude,
                    e = a.zoomLatitude,
                    a = a.zoomLevel;
                !isNaN(b) && !isNaN(c) && this.zoomTo(a, b, c);
                !isNaN(d) && !isNaN(e) && this.zoomToLongLat(a, d, e, !0)
            }
        }
    },
    parseXMLNode: function (a, b, c, d) {
        void 0 === d && (d = "");
        var e, f, g;
        if (c) {
            var h = c.childNodes.length;
            for (e = 0; e < h; e++) {
                f = c.childNodes[e];
                var j = f.nodeName,
                    k = f.nodeValue ? this.trim(f.nodeValue) : "",
                    l = !1;
                f.attributes && 0 < f.attributes.length && (l = !0);
                if (!(0 === f.childNodes.length && "" === k && !1 === l)) if (3 == f.nodeType || 4 == f.nodeType) {
                    if ("" !== k) {
                        f = 0;
                        for (g in a[b]) a[b].hasOwnProperty(g) && f++;
                        f ? a[b]["#text"] = k : a[b] = k
                    }
                } else if (1 == f.nodeType) {
                    var p;
                    void 0 !== a[b][j] ? void 0 === a[b][j].length ? (p = a[b][j], a[b][j] = [], a[b][j].push(p), a[b][j].push({}), p = a[b][j][1]) : "object" == typeof a[b][j] && (a[b][j].push({}), p = a[b][j][a[b][j].length - 1]) : (a[b][j] = {}, p = a[b][j]);
                    if (f.attributes && f.attributes.length) for (k = 0; k < f.attributes.length; k++) p[f.attributes[k].name] = f.attributes[k].value;
                    void 0 !== a[b][j].length ? this.parseXMLNode(a[b][j], a[b][j].length - 1, f, d + "  ") : this.parseXMLNode(a[b], j, f, d + "  ")
                }
            }
            f = 0;
            c = "";
            for (g in a[b]) "#text" == g ? c = a[b][g] : f++;
            0 === f && void 0 === a[b].length && (a[b] = c)
        }
    },
    doDoubleClickZoom: function () {
        if (!this.mapWasDragged) {
            var a = this.zoomLevel() * this.zoomControl.zoomFactor;
            this.zoomToStageXY(a, this.mouseX, this.mouseY)
        }
    },
    getDevInfo: function () {
        var a = this.zoomLevel(),
            a = {
                chart: this,
                type: "writeDevInfo",
                zoomLevel: a,
                zoomX: this.zoomX(),
                zoomY: this.zoomY(),
                zoomLatitude: this.zoomLatitude(),
                zoomLongitude: this.zoomLongitude(),
                latitude: this.coordinateToLatitude((this.mouseY - this.mapContainer.y) / a),
                longitude: this.coordinateToLongitude((this.mouseX - this.mapContainer.x) / a),
                left: this.mouseX,
                top: this.mouseY,
                right: this.realWidth - this.mouseX,
                bottom: this.realHeight - this.mouseY,
                percentLeft: Math.round(100 * (this.mouseX / this.realWidth)) + "%",
                percentTop: Math.round(100 * (this.mouseY / this.realHeight)) + "%",
                percentRight: Math.round(100 * ((this.realWidth - this.mouseX) / this.realWidth)) + "%",
                percentBottom: Math.round(100 * ((this.realHeight - this.mouseY) / this.realHeight)) + "%"
            }, b = "zoomLevel:" + a.zoomLevel + ", zoomLongitude:" + a.zoomLongitude + ", zoomLatitude:" + a.zoomLatitude + "\n",
            b = b + ("zoomX:" + a.zoomX + ", zoomY:" + a.zoomY + "\n"),
            b = b + ("latitude:" + a.latitude + ", longitude:" + a.longitude + "\n"),
            b = b + ("left:" + a.left + ", top:" + a.top + "\n"),
            b = b + ("right:" + a.right + ", bottom:" + a.bottom + "\n"),
            b = b + ('left:"' + a.percentLeft + '", top:"' + a.percentTop + '"\n'),
            b = b + ('right:"' + a.percentRight + '", bottom:"' + a.percentBottom + '"\n');
        a.str = b;
        this.fire(a.type, a)
    },
    getXY: function (a, b, c) {
        void 0 !== a && (-1 != String(a).indexOf("%") ? (a = Number(a.split("%").join("")), c && (a = 100 - a), a = Number(a) * b / 100) : c && (a = b - a));
        return a
    },
    getObjectById: function (a) {
        var b = this.dataProvider;
        if (b.areas) {
            var c = this.getObject(a, b.areas);
            if (c) return c
        }
        if (c = this.getObject(a, b.images)) return c;
        if (a = this.getObject(a, b.lines)) return a
    },
    getObject: function (a, b) {
        if (b) {
            var c;
            for (c = 0; c < b.length; c++) {
                var d = b[c];
                if (d.id == a) return d;
                if (d.areas) {
                    var e = this.getObject(a, d.areas);
                    if (e) return e
                }
                if (e = this.getObject(a, d.images)) return e;
                if (d = this.getObject(a, d.lines)) return d
            }
        }
    },
    parseData: function () {
        var a = this.dataProvider;
        this.processObject(a.areas, a, "area");
        this.processObject(a.images, a, "image");
        this.processObject(a.lines, a, "line")
    },
    processObject: function (a, b, c) {
        if (a) {
            var d;
            for (d = 0; d < a.length; d++) {
                var e = a[d];
                e.parentObject = b;
                "area" == c && AmCharts.extend(e, new AmCharts.MapArea);
                "image" == c && AmCharts.extend(e, new AmCharts.MapImage);
                "line" == c && AmCharts.extend(e, new AmCharts.MapLine);
                e.areas && this.processObject(e.areas, e, "area");
                e.images && this.processObject(e.images, e, "image");
                e.lines && this.processObject(e.lines, e, "line")
            }
        }
    },
    getX: function (a, b) {
        return this.getXY(a, this.realWidth, b)
    },
    getY: function (a, b) {
        return this.getXY(a, this.realHeight, b)
    },
    trim: function (a) {
        if (a) {
            var b;
            for (b = 0; b < a.length; b++) if (-1 === " \n\r\t\f\x0B\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(a.charAt(b))) {
                a = a.substring(b);
                break
            }
            for (b = a.length - 1; 0 <= b; b--) if (-1 === " \n\r\t\f\x0B\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(a.charAt(b))) {
                a = a.substring(0, b + 1);
                break
            }
            return -1 === " \n\r\t\f\x0B\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(a.charAt(0)) ? a : ""
        }
    },
    drb: function () {
        var a = this.product,
            b = a + "",
            c = window.location.hostname.split("."),
            d;
        2 <= c.length && (d = c[c.length - 2] + "." + c[c.length - 1]);
        AmCharts.remove(this.bbset);
        if (d != b) {
            var b = b + "/?utm_source=swf&utm_medium=demo&utm_campaign=jsDemo" + a,
                e = "",
                c = 145;
            "" == a && (e = "", c = 125);
            d = AmCharts.rect(this.container, c, 20, "#FFFFFF", 1);
            e = AmCharts.text(this.container, e + a + "", "#000000", "Verdana", 11, "start");
            e.translate(7, 9);
            d = this.container.set([d, e]);
            "" == a && d.translate(this.realWidth - c, 0);
            this.bbset = d;
            this.linkSet.push(d);
            d.setAttr("cursor", "pointer");
            d.click(function () {
                window.location.href = "http://" + b
            });
            for (a = 0; a < d.length; a++) d[a].attr({
                cursor: "pointer"
            })
        }
    }
});
AmCharts.ZoomControl = AmCharts.Class({
    construct: function () {
        this.panStepSize = 0.1;
        this.zoomFactor = 2;
        this.maxZoomLevel = 64;
        this.minZoomLevel = 1;
        this.zoomControlEnabled = this.panControlEnabled = !0;
        this.buttonRollOverColor = "#CC0000";
        this.buttonFillColor = "#990000";
        this.buttonFillAlpha = 1;
        this.buttonBorderColor = "#FFFFFF";
        this.buttonBorderThickness = this.buttonBorderAlpha = 1;
        this.buttonIconColor = "#FFFFFF";
        this.buttonColorHover = "#FF0000";
        this.gridColor = this.homeIconColor = "#FFFFFF";
        this.gridBackgroundColor = "#000000";
        this.gridBackgroundAlpha = 0.15;
        this.gridAlpha = 1;
        this.buttonSize = 18;
        this.iconSize = 11;
        this.buttonCornerRadius = 0;
        this.gridHeight = 150;
        this.top = this.left = 10
    },
    init: function (a, b) {
        var c = this;
        c.chart = a;
        AmCharts.remove(c.set);
        var d = b.set();
        d.translate(a.getX(c.left), a.getY(c.top));
        var e = c.buttonSize,
            f = c.buttonFillColor,
            g = c.buttonFillAlpha,
            h = c.buttonBorderThickness,
            j = c.buttonBorderColor,
            k = c.buttonBorderAlpha,
            l = c.buttonCornerRadius,
            p = c.buttonRollOverColor,
            x = c.gridHeight,
            q = c.zoomFactor,
            y = c.minZoomLevel,
            D = c.maxZoomLevel;
        c.previousDY = NaN;
        var m;
        if (c.zoomControlEnabled) {
            m = b.set();
            d.push(m);
            c.set = d;
            c.zoomSet = m;
            var t = AmCharts.rect(b, e + 6, x + 2 * e + 6, c.gridBackgroundColor, c.gridBackgroundAlpha, 0, 0, 0, 4);
            t.translate(-3, -3);
            t.mouseup(function () {
                c.handleBgUp()
            });
            m.push(t);
            t = new AmCharts.SimpleButton;
            t.setIcon(a.pathToImages + "plus.gif", c.iconSize);
            t.setClickHandler(a.zoomIn, a);
            t.init(b, e, e, f, g, h, j, k, l, p);
            m.push(t.set);
            t = new AmCharts.SimpleButton;
            t.setIcon(a.pathToImages + "minus.gif", c.iconSize);
            t.setClickHandler(a.zoomOut, a);
            t.init(b,
                e, e, f, g, h, j, k, l, p);
            t.set.translate(0, x + e);
            m.push(t.set);
            var A = Math.log(D / y) / Math.log(q) + 1,
                t = x / A,
                v;
            for (v = 1; v < A; v++) {
                var s = e + v * t,
                    s = AmCharts.line(b, [1, e - 2], [s, s], c.gridColor, c.gridAlpha, 1);
                m.push(s)
            }
            A = new AmCharts.SimpleButton;
            A.setDownHandler(c.draggerDown, c);
            A.setClickHandler(c.draggerUp, c);
            A.init(b, e, t, f, g, h, j, k, l, p);
            m.push(A.set);
            c.dragger = A.set;
            c.previousY = NaN;
            x -= t;
            y = Math.log(y / 100) / Math.log(q);
            q = Math.log(D / 100) / Math.log(q);
            c.realStepSize = x / (q - y);
            c.realGridHeight = x;
            c.stepMax = q
        }
        c.panControlEnabled && (q = b.set(), d.push(q), m && m.translate(e, 4 * e), m = new AmCharts.SimpleButton, m.setIcon(a.pathToImages + "panLeft.gif", c.iconSize), m.setClickHandler(a.moveLeft, a), m.init(b, e, e, f, g, h, j, k, l, p), m.set.translate(0, e), q.push(m.set), m = new AmCharts.SimpleButton, m.setIcon(a.pathToImages + "panRight.gif", c.iconSize), m.setClickHandler(a.moveRight, a), m.init(b, e, e, f, g, h, j, k, l, p), m.set.translate(2 * e, e), q.push(m.set), m = new AmCharts.SimpleButton, m.setIcon(a.pathToImages + "panUp.gif", c.iconSize), m.setClickHandler(a.moveUp, a),
            m.init(b, e, e, f, g, h, j, k, l, p), m.set.translate(e, 0), q.push(m.set), m = new AmCharts.SimpleButton, m.setIcon(a.pathToImages + "panDown.gif", c.iconSize), m.setClickHandler(a.moveDown, a), m.init(b, e, e, f, g, h, j, k, l, p), m.set.translate(e, 2 * e), q.push(m.set), g = new AmCharts.SimpleButton, g.setIcon(a.pathToImages + "homeIcon.gif", c.iconSize), g.setClickHandler(a.goHome, a), g.init(b, e, e, f, 0, 0, j, 0, l, p), g.set.translate(e, e), q.push(g.set), d.push(q))
    },
    draggerDown: function () {
        this.chart.stopDrag();
        this.isDragging = !0
    },
    draggerUp: function () {
        this.isDragging = !1
    },
    handleBgUp: function () {
        var a = this.chart,
            b = 100 * Math.pow(this.zoomFactor, this.stepMax - (a.mouseY - this.zoomSet.y - this.set.y - this.buttonSize - this.realStepSize / 2) / this.realStepSize);
        a.zoomTo(b)
    },
    update: function () {
        var a, b = this.zoomFactor,
            c = this.realStepSize,
            d = this.stepMax,
            e = this.dragger,
            f = this.buttonSize,
            g = this.chart;
        this.isDragging ? (g.stopDrag(), a = e.y + (g.mouseY - this.previousY), a = AmCharts.fitToBounds(a, f, this.realGridHeight + f), c = 100 * Math.pow(b, d - (a - f) / c), g.zoomTo(c, NaN, NaN, !0)) : (a = Math.log(g.zoomLevel() / 100) / Math.log(b), a = (d - a) * c + f);
        this.previousY = g.mouseY;
        this.previousDY != a && e && (e.translate(0, a), this.previousDY = a)
    }
});
AmCharts.SimpleButton = AmCharts.Class({
    construct: function () {},
    init: function (a, b, c, d, e, f, g, h, j, k) {
        var l = this;
        l.rollOverColor = k;
        l.color = d;
        k = a.set();
        l.set = k;
        d = AmCharts.rect(a, b, c, d, e, f, g, h, j);
        k.push(d);
        if (e = l.iconPath) f = l.iconSize, a = a.image(e, (b - f) / 2, (c - f) / 2, f, f), k.push(a), a.mousedown(function () {
            l.handleDown()
        }).mouseup(function () {
                l.handleUp()
            }).mouseover(function () {
                l.handleOver()
            }).mouseout(function () {
                l.handleOut()
            });
        d.mousedown(function () {
            l.handleDown()
        }).mouseup(function () {
                l.handleUp()
            }).mouseover(function () {
                l.handleOver()
            }).mouseout(function () {
                l.handleOut()
            });
        l.bg = d
    },
    setIcon: function (a, b) {
        this.iconPath = a;
        this.iconSize = b
    },
    setClickHandler: function (a, b) {
        this.clickHandler = a;
        this.scope = b
    },
    setDownHandler: function (a, b) {
        this.downHandler = a;
        this.scope = b
    },
    handleUp: function () {
        var a = this.clickHandler;
        a && a.call(this.scope)
    },
    handleDown: function () {
        var a = this.downHandler;
        a && a.call(this.scope)
    },
    handleOver: function () {
        this.bg.setAttr("fill", this.rollOverColor)
    },
    handleOut: function () {
        this.bg.setAttr("fill", this.color)
    }
});
AmCharts.SmallMap = AmCharts.Class({
    construct: function () {
        this.mapColor = "#e6e6e6";
        this.rectangleColor = "#FFFFFF";
        this.top = this.right = 10;
        this.minimizeButtonWidth = 16;
        this.backgroundColor = "#9A9A9A";
        this.backgroundAlpha = 1;
        this.borderColor = "#FFFFFF";
        this.borderThickness = 3;
        this.borderAlpha = 1;
        this.size = 0.2
    },
    init: function (a, b) {
        var c = this;
        c.chart = a;
        c.container = b;
        c.width = a.realWidth * c.size;
        c.height = a.realHeight * c.size;
        AmCharts.remove(c.set);
        var d = b.set();
        c.set = d;
        var e = b.set();
        c.allSet = e;
        d.push(e);
        c.buildSVGMap();
        var f = c.borderThickness,
            g = c.borderColor,
            h = AmCharts.rect(b, c.width + f, c.height + f, c.backgroundColor, c.backgroundAlpha, f, g, c.borderAlpha);
        h.translate(-f / 2, -f / 2);
        e.push(h);
        h.toBack();
        var j, k, h = c.minimizeButtonWidth,
            l = new AmCharts.SimpleButton;
        l.setIcon(a.pathToImages + "arrowDown.gif", h);
        l.setClickHandler(c.minimize, c);
        l.init(b, h, h, g, 1, 1, g, 1);
        l = l.set;
        c.downButtonSet = l;
        d.push(l);
        var p = new AmCharts.SimpleButton;
        p.setIcon(a.pathToImages + "arrowUp.gif", h);
        p.setClickHandler(c.maximize, c);
        p.init(b, h, h, g, 1, 1, g,
            1);
        g = p.set;
        c.upButtonSet = g;
        g.hide();
        d.push(g);
        var x, q;
        isNaN(c.top) || (j = a.getY(c.top) + f, q = 0);
        isNaN(c.bottom) || (j = a.getY(c.bottom, !0) - c.height - f, q = c.height - h + f / 2);
        isNaN(c.left) || (k = a.getX(c.left) + f, x = -f / 2);
        isNaN(c.right) || (k = a.getX(c.right, !0) - c.width - f, x = c.width - h + f / 2);
        f = b.set();
        f.clipRect(1, 1, c.width, c.height);
        e.push(f);
        c.rectangleC = f;
        d.translate(k, j);
        l.translate(x, q);
        g.translate(x, q);
        e.mouseup(function () {
            c.handleMouseUp()
        });
        c.drawRectangle()
    },
    minimize: function () {
        this.downButtonSet.hide();
        this.upButtonSet.show();
        this.allSet.hide()
    },
    maximize: function () {
        this.downButtonSet.show();
        this.upButtonSet.hide();
        this.allSet.show()
    },
    buildSVGMap: function () {
        var a = this.chart,
            b = {
                fill: this.mapColor,
                stroke: this.mapColor,
                "stroke-opacity": 1
            }, c = a.svgData.g.path,
            d = this.container,
            e = d.set(),
            f;
        for (f = 0; f < c.length; f++) {
            path = c[f].d;
            var g = d.path(path).attr(b);
            e.push(g)
        }
        this.allSet.push(e);
        b = e.getBBox();
        c = this.size * a.mapScale;
        d = -b.x * c;
        f = -b.y * c;
        var h = g = 0;
        a.centerMap && (g = (this.width - b.width * c) / 2, h = (this.height - b.height * c) / 2);
        this.mapWidth = b.width * c;
        this.mapHeight = b.height * c;
        this.dx = g;
        this.dy = h;
        e.translate(d + g, f + h, c)
    },
    update: function () {
        var a = this.chart,
            b = a.zoomLevel(),
            c = this.width,
            d = a.mapContainer,
            a = c / (a.realWidth * b),
            c = c / b,
            b = this.height / b,
            e = this.rectangle;
        e.translate(-d.x * a + this.dx, -d.y * a + this.dy);
        0 < c && 0 < b && (e.setAttr("width", c), e.setAttr("height", b));
        this.rWidth = c;
        this.rHeight = b
    },
    drawRectangle: function () {
        var a = this.rectangle;
        AmCharts.remove(a);
        a = AmCharts.rect(this.container, 10, 10, "#000", 0, 1, this.rectangleColor, 1);
        this.rectangleC.push(a);
        this.rectangle = a
    },
    handleMouseUp: function () {
        var a = this.chart,
            b = a.zoomLevel();
        a.zoomTo(b, -((a.mouseX - this.set.x - this.dx - this.rWidth / 2) / this.mapWidth) * b, -((a.mouseY - this.set.y - this.dy - this.rHeight / 2) / this.mapHeight) * b)
    }
});
AmCharts.AreasProcessor = AmCharts.Class({
    construct: function (a) {
        this.chart = a
    },
    process: function (a) {
        this.updateAllAreas();
        this.allObjects = [];
        a = a.areas;
        var b = this.chart,
            c = b.areasSettings,
            d = a.length,
            e, f, g = 0,
            h = 0,
            j = b.svgAreasById,
            k = c.color,
            l = c.alpha,
            p = c.outlineThickness,
            x = c.rollOverColor,
            q = c.selectedColor,
            y = c.rollOverAlpha,
            D = c.outlineColor,
            m = c.outlineAlpha,
            t = c.balloonText,
            A = c.rollOverOutlineColor,
            v = 0;
        for (e = 0; e < d; e++) f = a[e], f = Math.abs(f.value), v < f && (v = f), isNaN(f) || (g += f);
        b.maxValue = v;
        for (e = 0; e < d; e++) f = a[e],
            isNaN(f.value) ? f.percents = void 0 : (f.percents = 100 * (f.value / g), h < f.percents && (h = f.percents));
        for (e = 0; e < d; e++) {
            f = a[e];
            this.allObjects.push(f);
            f.chart = b;
            f.baseSettings = c;
            f.autoZoomReal = void 0 == f.autoZoom ? c.autoZoom : f.autoZoom;
            g = f.color;
            void 0 == g && (g = k);
            v = f.alpha;
            isNaN(v) && (v = l);
            var s = f.rollOverAlpha;
            isNaN(s) && (s = y);
            isNaN(s) && (s = v);
            var n = f.rollOverColor;
            void 0 == n && (n = x);
            var u = f.selectedColor;
            void 0 == u && (u = q);
            var H = f.balloonText;
            H || (H = t);
            if (void 0 != c.colorSolid) if (isNaN(f.percents)) f.colorReal = g;
            else {
                var E = f.percents / h,
                    z = 100 / (b.colorSteps - 1),
                    E = Math.ceil(100 * E / z) * z / 100;
                f.colorReal = AmCharts.getColorFade(g, c.colorSolid, E)
            }
            E = f.outlineColor;
            void 0 == E && (E = D);
            z = f.outlineAlpha;
            isNaN(z) && (z = m);
            var r = f.outlineThickness;
            isNaN(r) && (r = p);
            var w = f.rollOverOutlineColor;
            void 0 == w && (w = A);
            f.alphaReal = v;
            f.rollOverColorReal = n;
            f.rollOverAlphaReal = s;
            f.balloonTextReal = H;
            f.selectedColorReal = u;
            f.outlineColorReal = E;
            f.outlineAlphaReal = z;
            f.rollOverOutlineColorReal = w;
            AmCharts.processDescriptionWindow(c, f);
            if (n = j[f.id]) {
                s = n.area;
                if ((n = n.title) && !f.title) f.title = n;
                if (s) {
                    f.displayObject = s;
                    f.mouseEnabled && b.addObjectEventListeners(s, f);
                    var C;
                    void 0 != g && (C = g);
                    void 0 != f.colorReal && (C = f.showAsSelected || b.selectedObject == f ? f.selectedColorReal : f.colorReal);
                    s.setAttr("fill", C);
                    s.setAttr("stroke", E);
                    s.setAttr("stroke-opacity", z);
                    s.setAttr("stroke-width", r);
                    s.setAttr("fill-opacity", v)
                }
            }
        }
    },
    updateAllAreas: function () {
        var a = this.chart,
            b = a.areasSettings,
            c = b.unlistedAreasColor,
            d = b.unlistedAreasAlpha,
            e = b.unlistedAreasOutlineColor,
            f = b.unlistedAreasOutlineAlpha,
            g = a.svgAreas,
            a = a.dataProvider,
            h = a.areas,
            j = {}, k;
        for (k = 0; k < h.length; k++) j[h[k].id] = h[k];
        for (k = 0; k < g.length; k++) if (h = g[k], void 0 != c && h.setAttr("fill", c), isNaN(d) || h.setAttr("fill-opacity", d), void 0 != e && h.setAttr("stroke", e), isNaN(f) || h.setAttr("stroke-opacity", f), h.setAttr("stroke-width", b.outlineThickness), a.getAreasFromMap && !j[h.id]) {
            var l = new AmCharts.MapArea;
            l.parentObject = a;
            l.id = h.id;
            a.areas.push(l)
        }
    }
});
AmCharts.AreasSettings = AmCharts.Class({
    construct: function () {
        this.alpha = 1;
        this.autoZoom = !1;
        this.balloonText = "[[title]]";
        this.color = "#FFCC00";
        this.colorSolid = "#990000";
        this.unlistedAreasAlpha = 1;
        this.unlistedAreasColor = "#DDDDDD";
        this.outlineColor = "#FFFFFF";
        this.outlineAlpha = 1;
        this.outlineThickness = 0.5;
        this.selectedColor = this.rollOverOutlineColor = "#CC0000";
        this.unlistedAreasOutlineColor = "#FFFFFF";
        this.unlistedAreasOutlineAlpha = 1;
        this.descriptionWindowWidth = 250
    }
});
AmCharts.ImagesProcessor = AmCharts.Class({
    construct: function (a) {
        this.chart = a;
        this.reset()
    },
    process: function (a) {
        var b = a.images,
            c;
        for (c = 0; c < b.length; c++) this.createImage(b[c], c);
        a.parentObject && a.remainVisible && this.process(a.parentObject)
    },
    createImage: function (a, b) {
        var c = this.chart,
            d = c.container,
            e = c.mapObjectsContainer,
            f = c.stageObjectsContainer,
            g = c.imagesSettings;
        a.remove();
        var h = g.color,
            j = g.alpha,
            k = g.rollOverColor,
            l = g.selectedColor,
            p = g.balloonText,
            x = g.outlineColor,
            q = g.outlineAlpha,
            y = g.outlineThickness,
            D = g.selectedScale,
            m = g.labelPosition,
            t = g.labelColor,
            A = g.labelFontSize,
            v = g.labelRollOverColor;
        a.index = b;
        a.chart = c;
        a.baseSettings = c.imagesSettings;
        var s = d.set();
        a.displayObject = s;
        var n = a.color;
        void 0 == n && (n = h);
        h = a.alpha;
        isNaN(h) && (h = j);
        j = a.outlineAlpha;
        isNaN(j) && (j = q);
        q = a.rollOverColor;
        void 0 == q && (q = k);
        k = a.selectedColor;
        void 0 == k && (k = l);
        (l = a.balloonText) || (l = p);
        p = a.outlineColor;
        void 0 == p && (p = x);
        void 0 == p && (p = n);
        x = a.outlineThickness;
        isNaN(x) && (x = y);
        (y = a.labelPosition) || (y = m);
        m = a.labelColor;
        void 0 == m && (m = t);
        t = a.labelRollOverColor;
        void 0 == t && (t = v);
        v = a.labelFontSize;
        isNaN(v) && (v = A);
        A = a.selectedScale;
        isNaN(A) && (A = D);
        isNaN(a.rollOverScale);
        a.colorReal = n;
        a.alphaReal = h;
        a.rollOverColorReal = q;
        a.balloonTextReal = l;
        a.selectedColorReal = k;
        a.labelColorReal = m;
        a.labelRollOverColorReal = t;
        a.labelFontSizeReal = v;
        a.labelPositionReal = y;
        a.selectedScaleReal = A;
        a.rollOverScaleReal = A;
        AmCharts.processDescriptionWindow(g, a);
        a.centeredReal = void 0 == a.centered ? g.centered : a.centered;
        v = a.type;
        t = a.imageURL;
        q = a.svgPath;
        m = a.width;
        k = a.height;
        g = a.scale;
        isNaN(a.percentWidth) || (m = a.percentWidth / 100 * c.realWidth);
        isNaN(a.percentHeight) || (k = a.percentHeight / 100 * c.realHeight);
        var u;
        !t && (!v && !q) && (v = "circle", m = 1, j = h = 0);
        y = D = 0;
        A = a.selectedColorReal;
        v ? (isNaN(m) && (m = 10), isNaN(k) && (k = 10), "kilometers" == a.widthAndHeightUnits && (m = c.kilometersToPixels(a.width), k = c.kilometersToPixels(a.height)), "miles" == a.widthAndHeightUnits && (m = c.milesToPixels(a.width), k = c.milesToPixels(a.height)), u = this.createPredefinedImage(n, p, x, v, m, k), y = D = 0, a.centeredReal && (D = isNaN(a.right) ? -m / 2 : m / 2, y = isNaN(a.bottom) ? -k / 2 : k / 2), u.translate(D, y)) : t ? (isNaN(m) && (m = 10), isNaN(k) && (k = 10), u = d.image(t, 0, 0, m, k), u.node.setAttribute("preserveAspectRatio", "none"), u.setAttr("opacity", h), a.centeredReal && (D = isNaN(a.right) ? -m / 2 : m / 2, y = isNaN(a.bottom) ? -k / 2 : k / 2, u.translate(D, y))) : q && (u = d.path(q), p = u.getBBox(), a.centeredReal ? (D = -p.x * g - p.width * g / 2, isNaN(a.right) || (D = -D), y = -p.y * g - p.height * g / 2, isNaN(a.bottom) || (y = -y)) : D = y = 0, u.translate(D, y, g), u.x = D, u.y = y);
        u && (s.push(u), a.image = u, u.setAttr("stroke-opacity",
            j), u.setAttr("fill-opacity", h), u.setAttr("fill", n));
        (a.showAsSelected || c.selectedObject == a) && void 0 != A && u.setAttr("fill", A);
        n = null;
        a.label && (n = AmCharts.text(d, a.label, a.labelColorReal, c.fontFamily, a.labelFontSizeReal, a.labelAlign), a.imageLabel = n, !a.labelInactive && a.mouseEnabled && c.addObjectEventListeners(n, a), s.push(n));
        !isNaN(a.latitude) && !isNaN(a.longitude) ? e.push(s) : f.push(s);
        s && (s.rotation = a.rotation);
        this.updateSizeAndPosition(a);
        a.mouseEnabled && c.addObjectEventListeners(s, a)
    },
    updateSizeAndPosition: function (a) {
        var b = this.chart,
            c = a.displayObject,
            d = b.getX(a.left),
            e = b.getY(a.top),
            f = a.image.getBBox();
        isNaN(a.right) || (d = b.getX(a.right, !0) - f.width * a.scale);
        isNaN(a.bottom) || (e = b.getY(a.bottom, !0) - f.height * a.scale);
        var g = a.longitude,
            h = a.latitude,
            f = this.objectsToResize;
        this.allSvgObjects.push(c);
        this.allObjects.push(a);
        var j = a.imageLabel;
        if (!isNaN(d) && !isNaN(e)) c.translate(d, e);
        else if (!isNaN(h) && !isNaN(g) && (d = b.longitudeToCoordinate(g), e = b.latitudeToCoordinate(h), c.translate(d, e, NaN, !0), a.fixedSize)) {
            d = 1;
            if (a.showAsSelected || b.selectedObject == a) d = a.selectedScaleReal;
            f.push({
                image: c,
                scale: d
            })
        }
        this.positionLabel(j, a, a.labelPositionReal)
    },
    positionLabel: function (a, b, c) {
        if (a) {
            var d = b.image,
                e = 0,
                f = 0,
                g = 0,
                h = 0;
            d && (h = d.getBBox(), f = d.y, e = d.x, g = h.width, h = h.height, b.svgPath && (g *= b.scale, h *= b.scale));
            var j = a.getBBox(),
                d = j.width,
                j = j.height;
            "right" == c && (e += g + d / 2 + 5, f += h / 2 - 2);
            "left" == c && (e += -d / 2 - 5, f += h / 2 - 2);
            "top" == c && (f -= j / 2 + 3, e += g / 2);
            "bottom" == c && (f += h + j / 2, e += g / 2);
            "middle" == c && (e += g / 2, f += h / 2);
            a.translate(e + b.labelShiftX, f + b.labelShiftY)
        }
    },
    createPredefinedImage: function (a, b, c, d, e, f) {
        var g = this.chart.container,
            h;
        switch (d) {
            case "circle":
                h = AmCharts.circle(g, e / 2, a, 1, c, b, 1);
                break;
            case "rectangle":
                h = AmCharts.rect(g, e, f, a, 1, c, b, 1);
                h.translate(-e / 2, -f / 2);
                break;
            case "bubble":
                h = AmCharts.circle(g, e / 2, a, 1, c, b, 1, !0)
        }
        return h
    },
    reset: function () {
        this.objectsToResize = [];
        this.allSvgObjects = [];
        this.allObjects = [];
        this.allLabels = []
    }
});
AmCharts.ImagesSettings = AmCharts.Class({
    construct: function () {
        this.balloonText = "[[title]]";
        this.alpha = 1;
        this.borderAlpha = 0;
        this.borderThickness = 1;
        this.labelPosition = "right";
        this.labelColor = "#000000";
        this.labelFontSize = 11;
        this.color = "#000000";
        this.labelRollOverColor = "#00CC00";
        this.centered = !0;
        this.rollOverScale = this.selectedScale = 1;
        this.descriptionWindowWidth = 250
    }
});
AmCharts.LinesProcessor = AmCharts.Class({
    construct: function (a) {
        this.chart = a;
        this.reset()
    },
    process: function (a) {
        var b = a.lines,
            c = this.chart,
            d = c.linesSettings,
            e = this.objectsToResize,
            f = c.mapObjectsContainer,
            g = c.stageObjectsContainer,
            h = d.thickness,
            j = d.dashLength,
            k = d.arrow,
            l = d.arrowSize,
            p = d.arrowColor,
            x = d.arrowAlpha,
            q = d.color,
            y = d.alpha,
            D = d.rollOverColor,
            m = d.selectedColor,
            t = d.rollOverAlpha,
            A = d.balloonText,
            v = c.container,
            s;
        for (s = 0; s < b.length; s++) {
            var n = b[s];
            n.chart = c;
            n.baseSettings = d;
            var u = v.set();
            n.displayObject = u;
            this.allSvgObjects.push(u);
            this.allObjects.push(n);
            n.mouseEnabled && c.addObjectEventListeners(u, n);
            if (n.remainVisible || c.selectedObject == n.parentObject) {
                var H = n.thickness;
                isNaN(H) && (H = h);
                var E = n.dashLength;
                isNaN(E) && (E = j);
                var z = n.color;
                void 0 == z && (z = q);
                var r = n.alpha;
                isNaN(r) && (r = y);
                var w = n.rollOverAlpha;
                isNaN(w) && (w = t);
                isNaN(w) && (w = r);
                var C = n.rollOverColor;
                void 0 == C && (C = D);
                var P = n.selectedColor;
                void 0 == P && (P = m);
                var N = n.balloonText;
                N || (N = A);
                var I = n.arrow;
                I || (I = k);
                var J = n.arrowColor;
                void 0 == J && (J = p);
                void 0 == J && (J = z);
                var K = n.arrowAlpha;
                isNaN(K) && (K = x);
                isNaN(K) && (K = r);
                var G = n.arrowSize;
                isNaN(G) && (G = l);
                n.alphaReal = r;
                n.colorReal = z;
                n.rollOverColorReal = C;
                n.rollOverAlphaReal = w;
                n.balloonTextReal = N;
                n.selectedColorReal = P;
                n.thicknessReal = H;
                AmCharts.processDescriptionWindow(d, n);
                var w = this.processCoordinates(n.x, c.realWidth),
                    C = this.processCoordinates(n.y, c.realHeight),
                    F = n.longitudes,
                    N = n.latitudes,
                    Q = F.length,
                    L;
                if (0 < Q) {
                    w = [];
                    for (L = 0; L < Q; L++) w.push(c.longitudeToCoordinate(F[L]))
                }
                Q = N.length;
                if (0 < Q) {
                    C = [];
                    for (L = 0; L < Q; L++) C.push(c.latitudeToCoordinate(N[L]))
                }
                if (0 < w.length) {
                    AmCharts.dx = 0;
                    AmCharts.dy = 0;
                    E = AmCharts.line(v, w, C, z, 1, H, E, !1, !1, !0);
                    AmCharts.dx = 0.5;
                    AmCharts.dy = 0.5;
                    u.push(E);
                    u.setAttr("opacity", r);
                    if ("none" != I) {
                        var B, M, O;
                        if ("end" == I || "both" == I) r = w[w.length - 1], z = C[C.length - 1], 1 < w.length ? (F = w[w.length - 2], B = C[C.length - 2]) : (F = r, B = z), B = 180 * Math.atan((z - B) / (r - F)) / Math.PI, M = r, O = z, B = 0 > r - F ? B - 90 : B + 90;
                        "both" == I && (r = AmCharts.polygon(v, [-G / 2, 0, G / 2], [1.5 * G, 0, 1.5 * G], J, K, 1, J, K), u.push(r), r.translate(M, O), r.rotate(B),
                            n.fixedSize && e.push(r));
                        if ("start" == I || "both" == I) r = w[0], O = C[0], 1 < w.length ? (z = w[1], M = C[1]) : (z = r, M = O), B = 180 * Math.atan((O - M) / (r - z)) / Math.PI, M = r, B = 0 > r - z ? B - 90 : B + 90;
                        "middle" == I && (r = w[w.length - 1], z = C[C.length - 1], 1 < w.length ? (F = w[w.length - 2], B = C[C.length - 2]) : (F = r, B = z), M = F + (r - F) / 2, O = B + (z - B) / 2, B = 180 * Math.atan((z - B) / (r - F)) / Math.PI, B = 0 > r - F ? B - 90 : B + 90);
                        r = AmCharts.polygon(v, [-G / 2, 0, G / 2], [1.5 * G, 0, 1.5 * G], J, K, 1, J, K);
                        u.push(r);
                        r.translate(M, O);
                        r.rotate(B);
                        n.fixedSize && e.push(r)
                    }
                    n.fixedSize && E && this.linesToResize.push({
                        line: E,
                        thickness: H
                    });
                    n.showAsSelected && !isNaN(P) && E.setAttr("stroke", P);
                    0 < N.length ? f.push(u) : g.push(u)
                }
            }
        }
        a.parentObject && a.remainVisible && this.process(a.parentObject)
    },
    processCoordinates: function (a, b) {
        var c = [],
            d;
        for (d = 0; d < a.length; d++) {
            var e = a[d],
                f = Number(e);
            isNaN(f) && (f = Number(e.replace("%", "")) * b / 100);
            isNaN(f) || c.push(f)
        }
        return c
    },
    reset: function () {
        this.objectsToResize = [];
        this.allSvgObjects = [];
        this.allObjects = [];
        this.linesToResize = []
    }
});
AmCharts.LinesSettings = AmCharts.Class({
    construct: function () {
        this.balloonText = "[[title]]";
        this.thickness = 1;
        this.dashLength = 0;
        this.arrowSize = 10;
        this.arrowAlpha = 1;
        this.arrow = "none";
        this.color = "#990000";
        this.descriptionWindowWidth = 250
    }
});
AmCharts.MapObject = AmCharts.Class({
    construct: function () {
        this.fixedSize = this.mouseEnabled = !0;
        this.images = [];
        this.lines = [];
        this.areas = [];
        this.remainVisible = !0;
        this.passZoomValuesToTarget = this.selectable = !1
    }
});
AmCharts.MapArea = AmCharts.Class({
    inherits: AmCharts.MapObject,
    construct: function () {
        this.objectType = "MapArea";
        AmCharts.MapArea.base.construct.call(this)
    }
});
AmCharts.MapLine = AmCharts.Class({
    inherits: AmCharts.MapObject,
    construct: function () {
        this.longitudes = [];
        this.latitudes = [];
        this.x = [];
        this.y = [];
        this.objectType = "MapLine";
        this.arrow = "none";
        AmCharts.MapLine.base.construct.call(this)
    }
});
AmCharts.MapImage = AmCharts.Class({
    inherits: AmCharts.MapObject,
    construct: function () {
        this.scale = 1;
        this.widthAndHeightUnits = "pixels";
        this.objectType = "MapImage";
        this.labelShiftY = this.labelShiftX = 0;
        AmCharts.MapImage.base.construct.call(this)
    },
    remove: function () {
        var a = this.displayObject;
        a && a.remove();
        (a = this.imageLabel) && a.remove()
    }
});
AmCharts.degreesToRadians = function (a) {
    return a / 180 * Math.PI
};
AmCharts.radiansToDegrees = function (a) {
    return 180 * (a / Math.PI)
};
AmCharts.getColorFade = function (a, b, c) {
    var d = AmCharts.hex2RGB(b);
    b = d[0];
    var e = d[1],
        d = d[2],
        f = AmCharts.hex2RGB(a);
    a = f[0];
    var g = f[1],
        f = f[2];
    a += Math.round((b - a) * c);
    g += Math.round((e - g) * c);
    f += Math.round((d - f) * c);
    return "rgb(" + a + "," + g + "," + f + ")"
};
AmCharts.hex2RGB = function (a) {
    return [parseInt(a.substring(1, 3), 16), parseInt(a.substring(3, 5), 16), parseInt(a.substring(5, 7), 16)]
};
AmCharts.processDescriptionWindow = function (a, b) {
    var c = a.descriptionWindowX,
        d = a.descriptionWindowY,
        e = a.descriptionWindowWidth,
        f = a.descriptionWindowHeight,
        g = b.descriptionWindowX;
    isNaN(g) && (g = c);
    c = b.descriptionWindowY;
    isNaN(c) && (c = d);
    d = b.descriptionWindowWidth;
    isNaN(d) && (d = e);
    e = b.descriptionWindowHeight;
    isNaN(e) && (e = f);
    b.descriptionWindowX = g;
    b.descriptionWindowY = c;
    b.descriptionWindowWidth = d;
    b.descriptionWindowHeight = e
};
AmCharts.MapData = AmCharts.Class({
    inherits: AmCharts.MapObject,
    construct: function () {
        AmCharts.MapData.base.construct.call(this);
        this.projection = "mercator";
        this.topLatitude = 90;
        this.bottomLatitude = -90;
        this.leftLongitude = -180;
        this.rightLongitude = 180;
        this.zoomLevel = 1;
        this.objectType = "MapData";
        this.getAreasFromMap = !1
    }
});
AmCharts.DescriptionWindow = AmCharts.Class({
    construct: function () {},
    show: function (a, b, c, d) {
        var e = this,
            f = document.createElement("div");
        f.style.position = "absolute";
        f.className = "ammapDescriptionWindow";
        e.div = f;
        b.appendChild(f);
        var g = document.createElement("img");
        g.className = "ammapDescriptionWindowCloseButton";
        g.src = a.pathToImages + "xIcon.gif";
        g.style.cssFloat = "right";
        g.onclick = function () {
            e.close()
        };
        g.onmouseover = function () {
            g.src = a.pathToImages + "xIconH.gif"
        };
        g.onmouseout = function () {
            g.src = a.pathToImages +
                "xIcon.gif"
        };
        f.appendChild(g);
        b = document.createElement("div");
        b.className = "ammapDescriptionTitle";
        b.onmousedown = function () {
            e.div.style.zIndex = 1E3
        };
        f.appendChild(b);
        d = document.createTextNode(d);
        b.appendChild(d);
        d = b.offsetHeight;
        b = document.createElement("div");
        b.className = "ammapDescriptionText";
        b.style.maxHeight = e.maxHeight - d - 20 + "px";
        f.appendChild(b);
        b.innerHTML = c
    },
    close: function () {
        try {
            this.div.parentNode.removeChild(this.div)
        } catch (a) {}
    }
});
AmCharts.ValueLegend = AmCharts.Class({
    construct: function () {
        this.showAsGradient = !1;
        this.minValue = 0;
        this.height = 12;
        this.width = 200;
        this.bottom = this.left = 10;
        this.borderColor = "#FFFFFF";
        this.borderAlpha = this.borderThickness = 1;
        this.color = "#000000";
        this.fontSize = 11
    },
    init: function (a, b) {
        var c = a.areasSettings.color,
            d = a.areasSettings.colorSolid,
            e = a.colorSteps;
        AmCharts.remove(this.set);
        var f = b.set();
        this.set = f;
        var g = 0,
            h = this.minValue,
            j = this.fontSize,
            k = a.fontFamily,
            l = this.color;
        void 0 !== h && (g = AmCharts.text(b, h,
            l, k, j, "left"), g.translate(0, j / 2 - 1), f.push(g), g = g.getBBox().height);
        h = this.maxValue;
        void 0 === h && (h = a.maxValue);
        void 0 !== h && (g = AmCharts.text(b, h, l, k, j, "right"), g.translate(this.width, j / 2 - 1), f.push(g), g = g.getBBox().height);
        if (this.showAsGradient) c = AmCharts.rect(b, this.width, this.height, [c, d], 1, this.borderThickness, this.borderColor, 1, 0, 0), c.translate(0, g), f.push(c);
        else {
            j = this.width / e;
            for (k = 0; k < e; k++) l = AmCharts.getColorFade(c, d, 1 * k / (e - 1)), l = AmCharts.rect(b, j, this.height, l, 1, this.borderThickness, this.borderColor,
                1), l.translate(j * k, g), f.push(l)
        }
        d = c = 0;
        e = f.getBBox();
        g = a.getY(this.bottom, !0);
        j = a.getY(this.top);
        k = a.getX(this.right, !0);
        l = a.getX(this.left);
        isNaN(j) || (c = j);
        isNaN(g) || (c = g - e.height);
        isNaN(l) || (d = l);
        isNaN(k) || (d = k - e.width);
        f.translate(d, c)
    }
});
AmCharts.ObjectList = AmCharts.Class({
    construct: function (a) {
        this.div = "object" != typeof a ? document.getElementById(a) : a
    },
    init: function (a) {
        this.chart = a;
        var b = document.createElement("div");
        b.className = "ammapObjectList";
        this.div.appendChild(b);
        this.addObjects(a.dataProvider, b)
    },
    addObjects: function (a, b) {
        var c = this.chart,
            d = document.createElement("ul"),
            e;
        if (a.areas) for (e = 0; e < a.areas.length; e++) {
            var f = a.areas[e];
            void 0 === f.showInList && (f.showInList = c.showAreasInList);
            this.addObject(f, d)
        }
        if (a.images) for (e = 0; e < a.images.length; e++) f = a.images[e], void 0 === f.showInList && (f.showInList = c.showImagesInList), this.addObject(f, d);
        if (a.lines) for (e = 0; e < a.lines.length; e++) f = a.lines[e], void 0 === f.showInList && (f.showInList = c.showLinesInList), this.addObject(f, d);
        0 < d.childNodes.length && b.appendChild(d)
    },
    addObject: function (a, b) {
        var c = this;
        if (a.showInList && void 0 !== a.title) {
            var d = document.createElement("li"),
                e = document.createTextNode(a.title),
                f = document.createElement("a");
            f.appendChild(e);
            d.appendChild(f);
            b.appendChild(d);
            this.addObjects(a, d);
            f.onmouseover = function () {
                c.chart.rollOverMapObject(a, !1)
            };
            f.onmouseout = function () {
                c.chart.rollOutMapObject(a)
            };
            f.onclick = function () {
                c.chart.clickMapObject(a)
            }
        }
    }
});