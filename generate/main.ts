#!/usr/bin/env -S deno run --allow-write --allow-read --allow-env
// @ts-ignore
import {colormath, Handlebars, path, palette} from "./palette.ts";

const calculateOpacity = (
    color: string,
    opacity: number,
    context: any,
): string => {
    const base = context.data.root.base;
    return colormath
        .mixColor(colormath.hex.toRgb(color), colormath.hex.toRgb(base), opacity)
        .hex.toLowerCase();
};

const handlebarsOpacity = (
    color: string,
    opacity: number,
    context: any,
) => {
    return calculateOpacity(color, opacity, context).replace("#", "")
}

const handlebarsOpacityWithHex = (
    color: string,
    opacity: number,
    context: any,
) => {
    return calculateOpacity(color, opacity, context)
}

const mix = (
    color1: string,
    color2: string,
    amount: number,
): string => {
    return colormath
        .mixColor(colormath.hex.toRgb(color1), colormath.hex.toRgb(color2), amount)
        .hex.toLowerCase()
};

const handlebarsMix = (
    color1: string,
    color2: string,
    amount: number,
): string => {
    return mix(color1, color2, amount).replace("#", "");
};

const handlebarsMixWithHex = (
    color1: string,
    color2: string,
    amount: number,
): string => {
    return mix(color1, color2, amount)
};

Handlebars.registerHelper("opacity", handlebarsOpacity);
Handlebars.registerHelper("opacityWithHex", handlebarsOpacityWithHex);
Handlebars.registerHelper("mix", handlebarsMix);
Handlebars.registerHelper("mixWithHex", handlebarsMixWithHex);

// @ts-ignore
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const themePath = path.join(__dirname, "../src/main/resources/themes/");
const editorPath = path.join(__dirname, "editor.xml");
const uiPath = path.join(__dirname, "ui.theme.json");
// @ts-ignore
Deno.mkdirSync(themePath, {recursive: true});

// @ts-ignore
Deno.readTextFile(uiPath).then((data: any) => {
    // @ts-ignore
    const hexValues = Object.entries(palette)
        .map(([key, value]) => {
            return {
                [key]: value.hex.toUpperCase(),
            };
        })
        .reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {});
    const options = {
        name: "Crema",

        accentColor: hexValues.brown,
        secondaryAccentColor: hexValues.magenta,
        primaryForeground: hexValues.text,
        primaryBackground: hexValues.base,
        secondaryBackground: hexValues.surface0,
        panelBackground: hexValues.mantle,
        hoverBackground: hexValues.surface0,
        selectionBackground: hexValues.surface0,
        selectionInactiveBackground: hexValues.base,
        borderColor: hexValues.base,
        separatorColor: hexValues.surface0,

        ...hexValues,
    };

    // TODO: Switch to `whiskers` at some point
    // Using handlebars syntax in the 'ui.theme.json` has the potential to conflict with valid json/yaml
    // This currently parses the string, converts it to a boolean, and then writes it into a file
    const output = Handlebars.compile(data)(options);
    const parsed = JSON.parse(output);
    parsed.dark = true;
    const fileName = "crema.theme.json";

    // @ts-ignore
    Deno.writeTextFileSync(path.join(themePath, fileName), JSON.stringify(parsed, null, 2));
});

// @ts-ignore
Deno.readTextFile(editorPath).then((data: any) => {
    // @ts-ignore
    const hexValues = Object.entries(palette)
        .map(([key, value]) => {
            const hex = value.hex.replace("#", "").toLowerCase();
            return {
                [key]: hex,
            };
        })
        .reduce((acc: any, curr: any) => ({...acc, ...curr}), {});

    const options = {
        name: "Crema",
        parent_scheme: "Darcula",

        ...hexValues,
    };
    const output = Handlebars.compile(data)(options);
    const fileName = "crema.xml";
    // @ts-ignore
    Deno.writeTextFileSync(path.join(themePath, fileName), output);
});
