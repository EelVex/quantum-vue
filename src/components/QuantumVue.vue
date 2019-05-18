<template>
  <div>
  <div v-if="showhelp" style='display: block; position: absolute; background: #fff; float: left; margin: 2em; padding: 2em; border: solid #222 2px;'>
    <strong>General state:</strong> <div v-katex:display="'\\cos(\\frac{\\theta}{2})\\left|0\\right> + e^{i \\phi}\\sin(\\frac{\\theta}{2})\\left|1\\right>'"></div>
    <strong>General gate:</strong> <div v-katex:display="'\\begin{pmatrix} \\cos(\\frac{\\theta}{2}) & -e^{i \\lambda} \\sin(\\frac{\\theta}{2})  \\\\  e^{i \\phi} \\sin(\\frac{\\theta}{2}) & e^{i \\lambda + i \\phi}  \\cos(\\frac{\\theta}{2}) \\end{pmatrix}'"></div>
    <button v-on:click="showhelp = false">hide</button>
  </div>
  <div v-if="!showhelp" style='display: block; position: absolute; background: #fff; float: left; margin: 1em;'>
    <button v-on:click="showhelp = true">show equations</button>
  </div>

  <h1>Initial State</h1>
  <div style='margin: auto; display: table;'>
    <div style=' display: table-cell ' v-for="(ang,ind) in angles[0]" :key="ind">
       <circle-slider v-model="angles[0][ind].v" :min="0" :max="ang.max" :step-size="0.01"></circle-slider>
       <span>{{ ang.name }} = {{ ang.v.toFixed(2) }}</span>
    </div>
  </div>
  <br />
  <div v-katex:display="state[0]"></div>

  <h1>Gate</h1>
  <div style='margin: auto; display: table;'>
    <div style=' display: table-cell ' v-for="(ang,ind) in angles[1]" :key="ind">
        <circle-slider v-model="angles[1][ind].v" :min="0" :max="ang.max" :step-size="0.01"></circle-slider>
        <span>{{ ang.name }} = {{ ang.v.toFixed(2) }}</span>
    </div>
  </div>
  <br />
  <div v-katex:display="gate"></div>

  <button v-on:click="makegate([0, 0, 0])">I</button>
  <button v-on:click="makegate([3.1415, 0, 3.1415])">X</button>
  <button v-on:click="makegate([3.1415, 3.1415/2, 3.1415/2])">Y</button>
  <button v-on:click="makegate([0, 3.1415/2, 3.1415/2])">Z</button>

  <h1>Final State</h1>

  <div v-katex:display="state[1]"></div>

  <h1>Measurement in {{ mbase }}</h1>
  <button  v-for="(base,i) in measurements" v-on:click="measure(base)" :key="i">{{ base }}</button>
  <div style='font-size: 1.2em' v-for="(txt,ind) in mbasis" :key="ind">
     <div style='display: inline-block' v-katex:display="txt" :key="ind"></div><span> → {{ p[ind] }}%</span>
     <progress-bar size="5" :val=p[ind] />
  </div>
  <br /> <br />
  </div>
</template>

<script>
import ProgressBar from 'vue-simple-progress'

export default {
  components: {
    ProgressBar
  },
  data () {
    return {
      angles: [
        [ { name: 'θ', v: 0, max: 3.14 }, { name: 'φ', v: 0, max: 6.28 } ],
        [ { name: 'θ', v: 0, max: 3.14 }, { name: 'φ', v: 0, max: 3.14 }, {name: 'λ', v: 0, max: 3.14} ]
      ],
      gate: '0',
      state: ['0', '0'],
      fstate: 0,
      measurements: ['X', 'Z'],
      mbase: 'Z',
      mbasis: ['\\left|0\\right>', '\\left|1\\right>'],
      p: [1, 0],
      showhelp: true
    }
  },
  methods: {
    angles_to_state (ang) {
      // convert [θ,φ] to state vector
      ang[0] = ang[0] / 2 // theta/2
      let [[cost, sint], [cosp, sinp]] = ang.map(x => [Math.cos(x), Math.sin(x)])
      let b = [cosp, sinp].map(x => (sint * x))
      let a = [cost, 0]
      return [a, b]
    },
    angles_to_matrix (ang) {
      // convert [θ,φ,λ] to unitary matrix
      ang[0] = ang[0] / 2 // theta/2
      let [[cost, sint], [cosp, sinp], [cosl, sinl]] = ang.map(x => [Math.cos(x), Math.sin(x)])
      let [breal, bimag, creal, cimag] = [-cosl, -sinl, cosp, sinp].map(x => (sint * x))
      let [dreal, dimag] = [Math.cos(ang[1] + ang[2]), Math.sin(ang[1] + ang[2])].map(x => (cost * x))
      let [d, c, b, a] = [[dreal, dimag], [creal, cimag], [breal, bimag], [cost, 0]]
      return [[a, b], [c, d]]
    },
    show_state (i, [a, b]) {
      // a, b are [real, imag] pairs
      [a, b] = [a, b].map(x => this.fmt_pair(x))
      this.state[i] = `${a}\\left|0\\right> + (${b}) \\left|1\\right>`
    },
    fmt_pair ([a, b]) {
      // pretty printing for complex numbers
      [a, b] = [a, b].map(x => Math.round(x * 100) / 100)
      if (a === 0 && b === 0) return '0'
      let sgn = '+'; if (b < 0) { sgn = '-'; b = -b } else if (a === 0) sgn = ''
      if (Math.abs(b) === 1) b = ''
      return (a !== 0 ? a : '') + (b !== 0 ? sgn + b + 'i' : '')
    },
    show_gate ([[a, b], [c, d]]) {
      [a, b, c, d] = [a, b, c, d].map(x => this.fmt_pair(x))

      this.gate = `\\begin{pmatrix} ${a} & ${b} \\\\  ${c} & ${d} \\end{pmatrix}`
    },
    makegate (ang) {
      for (var i = 0; i < 3; i++) this.angles[1][i].v = ang[i]
      this.show_gate(ang)
    },
    multiply (vec, mat) {
      vec = math.matrix(vec.map(x => math.complex(x[0], x[1])))
      mat = math.matrix(mat.map(x => x.map(y => math.complex(y[0], y[1]))))
      let res = math.multiply(mat, vec).valueOf()
      return [[res[0].re, res[0].im], [res[1].re, res[1].im]]
    },
    measure (base) {
      this.mbase = base
      let [a, b] = this.fstate.map(x => math.complex(x[0], x[1]))
      switch (base) {
        case 'Z':
          this.mbasis = ['\\left|0\\right>', '\\left|1\\right>']
          break
        case 'X':
          this.mbasis = ['\\frac{1}{\\sqrt{2}}(\\left|0\\right>+\\left|1\\right>)', '\\frac{1}{\\sqrt{2}}(\\left|0\\right>-\\left|1\\right>)']
          let H = math.multiply(math.matrix([[1, 1], [1, -1]]), math.sqrt(0.5))
          let res = math.multiply(H, math.matrix([a, b])).valueOf()
          a = res[0]; b = res[1]
          break
        default:
      }
      this.p = [a, b].map(x => Math.pow(x.abs(), 2))
      this.p = this.p.map(x => Math.round(x * 1000) / 10)
    }
  },
  watch: {
    angles: {
      immediate: true,
      deep: true,
      handler () {
        let svec = this.angles_to_state(this.angles[0].map(x => x.v))
        let umat = this.angles_to_matrix(this.angles[1].map(x => x.v))
        this.show_state(0, svec)
        this.show_gate(umat)
        this.fstate = this.multiply(svec, umat)
        this.show_state(1, this.fstate)
        this.measure(this.mbase)
      }
    }
  }
}
</script>
